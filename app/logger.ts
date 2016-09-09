export class Logger {

    public static root: Logger;
    public static DEBUG = 1;
    public static INFO = 2;
    public static ERROR = 3;

    private _config: LoggerConfig;

    constructor(public name?: string) {
        this._config = new LoggerConfig();
    }

    public static get(name?: string): Logger {
        // TODO: Store in a static map for persistent per logger based configuration.
        if (typeof name === 'undefined') return Logger.root;

        let logger = new Logger();
        logger.config.parent = Logger.root; // TODO A heirarchy based off . separators?
        return logger;
    }

    get config(): LoggerConfig {
        return this.config;
    }

    debug(data: any) {
        this.log(Logger.DEBUG, data);
    }

    info (data: any) {
        this.log(Logger.INFO, data);
    }

    error (data: any) {
        this.log(Logger.ERROR, data);
    }

    private log (level: number, data: any) {
        // TODO: Can probably separate appenders into another class if ever need different config for different loggers

        if (level === Logger.DEBUG) {
            console.debug(data);
        } else if (level === Logger.INFO) {
            console.info(data);
        } else if (level === Logger.ERROR) {
            console.error(data);
        }
    }

}

export class LoggerConfig {
    parent: Logger;
    private _level: number;

    get level(): number {
        if (typeof this._level === 'undefined') return this.parent.config.level;
    }
    set level(value: number) {
        this._level = value;
    }
    
}

Logger.root = new Logger();
Logger.root.config.level = Logger.DEBUG;
