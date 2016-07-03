import {Transaction} from '../../db/transaction';
import {Db} from '../../db/db';
import {TransactionProcessor} from '../../db/transactionProcessor';
import {Category} from '../records/category';
import {CategorySimpleWeeklyProcessor} from '../processors/categorySimpleWeeklyProcessor';


export class InitCategorySimpleWeeklyTransaction extends Transaction {

    categoryId : number;
    balanceDate : string;
    balance : BigJsLibrary.BigJS;
    weeklyAmount : BigJsLibrary.BigJS;

    getTypeId() : string {
        return "InitCategorySimpleWeeklyTransaction";
    }


    apply(tp : TransactionProcessor) {
        
        // TODO: Validation
        
        let table = tp.table(Category);
        let categoryRecord = table.by("id", <any> this.categoryId);
        if (categoryRecord == null) {
            JL().warn("Trying to processing category weekly transaction with invalid category. Skipping.");
            return;
        }
        let processor = new CategorySimpleWeeklyProcessor();
        processor.balance = this.balance;
        processor.weeklyAmount = this.weeklyAmount;
        processor.balanceDate = this.balanceDate;
        processor.category = categoryRecord;
        processor.transactionId = this.id;
        
        categoryRecord.engine.processors.push(processor);

        table.update(categoryRecord);
        
        // TODO: engine.execute ?? - needs to be called from elsewhere so it can be batched... but maybe have to fire an event here ?
    }

    update(tp :TransactionProcessor) {
        this.undo(tp);
        this.apply(tp);        
    }
    
    undo(tp :TransactionProcessor) {
        let table = tp.table(Category);
        let categoryRecord = table.by("id", <any> this.categoryId);

        if (categoryRecord == null) {
            JL().warn("Trying to processing category weekly transaction with invalid category. Skipping.");
            return;
        }

        // TODO: A better method of finding, or some centralised methods in engine rather than using the processors array directly...
        let categorySimpleWeeklyProcessor = categoryRecord.engine.processors.find(processor => {
            return processor.getTypeId() == "CategorySimpleWeeklyProcessor" && (<CategorySimpleWeeklyProcessor> processor).transactionId == this.id;
        });
        
        categoryRecord.engine.processors.splice(categoryRecord.engine.processors.indexOf(categorySimpleWeeklyProcessor), 1);
        
        table.update(categoryRecord);
    }

    static getFrom(db : Db, category : Category) : InitCategorySimpleWeeklyTransaction {
        let categorySimpleWeeklyProcessor = <CategorySimpleWeeklyProcessor>category.engine.processors.find(processor => {
            return processor.getTypeId() == "CategorySimpleWeeklyProcessor";
        });

        if (!categorySimpleWeeklyProcessor) return;
        return db.getTransaction<InitCategorySimpleWeeklyTransaction>((categorySimpleWeeklyProcessor).transactionId);
    }
    
    deserialize(field : string, value : any) : any {
        if (field == "balance")
            return new Big(value);
        if (field == "weeklyAmount")
            return new Big(value);
        return value;
    }

}

