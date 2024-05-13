import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormLayoutDemoComponent } from './formlayoutdemo.component';
import { FormLayoutDemoRoutingModule } from './formlayoutdemo-routing.module';
import { AutoCompleteModule } from "primeng/autocomplete";
import { CalendarModule } from "primeng/calendar";
import { ChipsModule } from "primeng/chips";
import { DropdownModule } from "primeng/dropdown";
import { InputMaskModule } from "primeng/inputmask";
import { InputNumberModule } from "primeng/inputnumber";
import { CascadeSelectModule } from "primeng/cascadeselect";
import { MultiSelectModule } from "primeng/multiselect";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputTextModule } from "primeng/inputtext";
import { Router } from '@angular/router';
import { PredictionService } from 'src/app/demo/service/prediction.service';
import { DialogModule } from 'primeng/dialog';
interface UserInput {
	tenure: number;
	monthlyCharges: number;
	numTechTickets: number;
	internetService: string;
	onlineSecurity: string;
	onlineBackup: string;
	deviceProtection: string;
	techSupport: string;
	contract: string;
	paperlessBilling: string;
	paymentMethod: string;
  }
  
  interface PredictionResponse {
	prediction: 'Churn' | 'No Churn';}
@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		FormLayoutDemoRoutingModule,
		AutoCompleteModule,
		CalendarModule,
		ChipsModule,
		DropdownModule,
		InputMaskModule,
		InputNumberModule,
		CascadeSelectModule,
		MultiSelectModule,
		InputTextareaModule,
		InputTextModule,
		DialogModule
	],
	declarations: [FormLayoutDemoComponent]
})
export class FormLayoutDemoModule { 
	
}