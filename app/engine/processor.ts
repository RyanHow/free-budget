import {TransactionProcessor} from '../db/transactionProcessor';

export abstract class Processor {
    
    abstract getTypeId(): String;
    abstract execute(tp: TransactionProcessor);
}