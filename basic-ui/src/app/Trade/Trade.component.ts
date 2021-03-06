/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { TradeService } from './Trade.service';
import 'rxjs/add/operator/toPromise';
import $ from 'jquery';

export class Ledger {
  $class: string;
  commodity: string;
  newOwner: string;
  transactionId: string;
  timestamp: string;

}

@Component({
  selector: 'app-trade',
  templateUrl: './Trade.component.html',
  styleUrls: ['./Trade.component.css'],
  providers: [TradeService]
})
export class TradeComponent implements OnInit {
 
  networkLedgers: Ledger[] = [];

  myForm: FormGroup;

  private allTransactions;
  private Transaction;
  private currentId;
  private errorMessage;
  private ledgerbuttonColor;
  private transbuttonColor;

  commodity = new FormControl('', Validators.required);
  newOwner = new FormControl('', Validators.required);
  transactionId = new FormControl('', Validators.required);
  timestamp = new FormControl('', Validators.required);

  baseUrl="http://localhost:3000/api/Trader";
  ledgerData1= "";
  ledgerData2= "";
  ledgerData3= "";
  

  constructor(private serviceTrade: TradeService, fb: FormBuilder) {
    this.myForm = fb.group({
      commodity: this.commodity,
      newOwner: this.newOwner,
      transactionId: this.transactionId,
      timestamp: this.timestamp
    });

    this.ledgerbuttonColor = "#5E747E";
    this.transbuttonColor = "#007ab4";
  };

  ngOnInit(): void {
    this.loadAll();
    this.showTable = false;
  }  

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceTrade.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(transaction => {
        tempList.push(transaction);
      });
      this.allTransactions = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the transaction field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the transaction updateDialog.
   * @param {String} name - the name of the transaction field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified transaction field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addTransaction(form: any): Promise<any> {
    this.ledgerbuttonColor = "#007ab4";
    this.transbuttonColor = "#5E747E";

    this.Transaction = {
      $class: 'jda.test.tutorialNetwork.Trade',
      'commodity': this.commodity.value,
      'newOwner': this.newOwner.value,
      'transactionId': this.transactionId.value,
      'timestamp': this.timestamp.value
    };

    this.myForm.setValue({
      'commodity': null,
      'newOwner': null,
      'transactionId': null,
      'timestamp': null
    });

    return this.serviceTrade.addTransaction(this.Transaction)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'commodity': null,
        'newOwner': null,
        'transactionId': null,
        'timestamp': null
      });
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
        this.errorMessage = error;
      }
    });
  }

  updateTransaction(form: any): Promise<any> {
    this.Transaction = {
      $class: 'org.example.biznet.Trade',
      'commodity': this.commodity.value,
      'newOwner': this.newOwner.value,
      'timestamp': this.timestamp.value
    };

    return this.serviceTrade.updateTransaction(form.get('transactionId').value, this.Transaction)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
      this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  deleteTransaction(): Promise<any> {

    return this.serviceTrade.deleteTransaction(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.serviceTrade.getTransaction(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'commodity': null,
        'newOwner': null,
        'transactionId': null,
        'timestamp': null
      };

      if (result.commodity) {
        formObject.commodity = result.commodity;
      } else {
        formObject.commodity = null;
      }

      if (result.newOwner) {
        formObject.newOwner = result.newOwner;
      } else {
        formObject.newOwner = null;
      }

      if (result.transactionId) {
        formObject.transactionId = result.transactionId;
      } else {
        formObject.transactionId = null;
      }

      if (result.timestamp) {
        formObject.timestamp = result.timestamp;
      } else {
        formObject.timestamp = null;
      }

      this.myForm.setValue(formObject);

    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
      this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  resetForm(): void {
    this.myForm.setValue({
      'commodity': null,
      'newOwner': null,
      'transactionId': null,
      'timestamp': null
    });
  }

  showLedger2() {
    console.log("reading ledger")
    this.serviceTrade.getLedger().subscribe(data =>
    {
      this.ledgerData1 = 
      "Order : " + data[0].commodity +  
      "<br>  New Owner: " 
      + data[0].newOwner 
      + "Transaction Id : " 
      + data[0].transactionId 
      + "Timestamp: " + data[0].timestamp;
    
     }
  );
  console.log("done readsig ledger");
  }


  showLedger() {    
    console.log("reading ledger")
    this.serviceTrade.getLedger().subscribe((data: Ledger[]) => {      

      for(var eachEntry in data){
        data[eachEntry].commodity = data[eachEntry].commodity.split('#')[1];
        data[eachEntry].newOwner = data[eachEntry].newOwner.split('#')[1];      
        
      }

      this.networkLedgers = data; 

      this.showTable = true;
     }
  );

   

  console.log("done reading ledger");

  }

  showTable = false;

  displayedColoumns=["commodity","newOwner","timestamp", "transactionId"];
}
