import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DashboardsRoutingModule } from './dashboard-routing.module';
import { HttpClient } from '@angular/common/http';
import { PredictionService } from '../../service/prediction.service';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { FileDemoRoutingModule } from '../uikit/file/filedemo-routing.module';
import { FileDemoModule } from '../uikit/file/filedemo.module';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        StyleClassModule,
        PanelMenuModule,
        ButtonModule,
        DashboardsRoutingModule,
        CardModule,
        DropdownModule,
        ChartModule,
        FileDemoRoutingModule,
		FileUploadModule,
        SkeletonModule,
        ToastModule,
        
    ],
    declarations: [DashboardComponent],
    providers:[MessageService ]
})
export class DashboardModule {}