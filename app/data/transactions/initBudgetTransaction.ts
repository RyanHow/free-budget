import {Transaction} from '../../db/transaction';
import {TransactionProcessor} from '../../db/transactionProcessor';
import {Budget} from '../records/budget';
import {Db} from '../../db/db';


export class InitBudgetTransaction extends Transaction {

    budgetName: string;    

    getTypeId(): string {
        return 'InitBudgetTransaction';
    }

    apply(tp: TransactionProcessor) {

        // TODO: Validation

        let budget = tp.single(Budget);
        budget.name = this.budgetName;
        tp.table(Budget).update(budget);
        tp.db.name(this.budgetName);
    }

    update(tp: TransactionProcessor) {
        this.apply(tp);
    }
    
    undo(tp: TransactionProcessor) {
        tp.unsupported();
    }

    static getFrom(db: Db): InitBudgetTransaction {
        return db.getTransaction<InitBudgetTransaction>(1001);
    }


    deserialize(field: string, value: any): any {
        return value;
    }

}