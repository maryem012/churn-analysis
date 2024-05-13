import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { ProductService } from '../../service/product.service';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { HttpClient } from '@angular/common/http';
import { PredictionService } from '../../service/prediction.service';

@Component({

    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
    uploadedFiles: any[] = [];

    items!: MenuItem[];

    options:any
    chartData: any;

    chartOptions: any;
    partialoptions:any
    subscription!: Subscription;
    file: File | null = null;
    predictions: any;
    clvData: any;
    churnData: any;
    clvOptions: any;
    fileData: any[] = null; // Initialize fileData as null initially
    churnOptions: any;
    isLoading = false;
    charges: any
    partialDependenceData: any;
    selectedFeature: string = 'tenure'; // Set default feature for partial dependence
    featureOptions = [
        { label: 'Tenure', value: 'tenure' },
        { label: 'Monthly Charges', value: 'MonthlyCharges' },
    ];
    data: { labels: string[]; datasets: { label: string; data: any[]; backgroundColor: string[]; borderColor: string[]; borderWidth: number; }[]; };

    selectedCharges: string = 'MonthlyCharges'; // Default to Monthly Charges
    chargeOptions = [
        { label: 'Total Charges', value: 'TotalCharges' },
        { label: 'Monthly Charges', value: 'MonthlyCharges' },
    ];

    constructor(private productService: ProductService, public layoutService: LayoutService, private http: HttpClient, private predictionService: PredictionService, private messageService: MessageService) {
        this.subscription = this.layoutService.configUpdate$
            .pipe(debounceTime(25))
            .subscribe((config) => {
            });
    }

    ngOnInit() {



        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];
        this.initializeCharts();

    }



    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    initializeCharts(): void {
        this.churnOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        color: '#333'
                    }
                },
                tooltip: {
                    enabled: true
                },
                title: {
                    display: true,
                    text: 'Churn Rate Distribution'
                }
            }
        };

        this.churnData = {
            labels: ['No CHURN', 'CHURN'],
            datasets: [
                {
                    data: [50, 50], // Placeholder data
                    backgroundColor: ['rgba(76, 175, 80, 0.2)', 'rgba(255, 193, 7, 0.2)'],
                    hoverBackgroundColor: ['#4CAF50', '#FFC107']
                }
            ]
        };

        this.clvOptions = {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: 'Customer Lifetime Value Distribution'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Categories'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Customers'
                    }
                }
            }
        };

        this.clvData = {
            labels: ['Low', 'Medium', 'High', 'Very High'],
            datasets: [
                {
                    label: 'Number of Customers',
                    data: [100, 200, 150, 50],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,

                }
            ]
        };

        this.partialDependenceData = {
            labels: [], // to be filled dynamically
            datasets: [
                {
                    label: 'Average Prediction',
                    data: [], // to be filled dynamically
                    borderColor: '#42A5F5',
                    backgroundColor: 'rgba(66, 165, 245, 0.5)',
                    fill: true
                }
            ]
        };
        this.data = {
            labels: ['Churned', 'Retained'],
            datasets: [
                {
                    label: 'Monthly Charges',
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                },
                {
                    label: 'Total Charges',
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 159, 64, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    }

    onFileSelected(event: any): void {
        this.file = event.target.files[0];
        const file = event.target.files[0];
      
        const formData = new FormData();
        formData.append('file', file);

        // Make HTTP request to upload file and fetch data
        this.http.post<any>('http://localhost:5001/upload-and-fetch-data', formData).subscribe(
            (response) => {
                this.fileData = response.data;
                const totalChargesSum = this.calculateTotalCharges(this.fileData);
                console.log('Total Charges Sum:', totalChargesSum);
                this.charges = totalChargesSum
                console.log(file)

                console.log(file.name)
                console.log(this.fileData)
            },
            (error) => {
                console.error('Failed to fetch file data:', error);
            }
        );
    
    }

    uploadAndPredict(): void {
        if (!this.file) {
            alert('Please select a file to upload.');
            return;
        }

        this.isLoading = true;
        const formData = new FormData();
        formData.append('file', this.file);

        this.http.post<any>('http://localhost:5001/upload-and-predict', formData).subscribe({
            next: (response) => {
                this.updateChurnChartData(response);
                this.calculateCLV();
                this.loadPartialDependence(this.selectedFeature);
                this.isLoading = false;
                this.loadChargesData(this.file); // Move inside the next callback
                this.updateChargesChartData(response);
            },
            error: (error) => {
                console.error('Prediction failed:', error);
                alert('Prediction failed: ' + error.message);
                this.isLoading = false;
            }
        });
   
    }

    calculateCLV(): void {
        if (!this.file) {
            alert('No file selected');
            return;
        }
        const formData = new FormData();
        formData.append('file', this.file);

        this.http.post<any>('http://localhost:5001/calculate-clv', formData).subscribe({
            next: (response) => {
                this.updateClvChartData(response);
            },
            error: (error) => {
                console.error('CLV calculation failed:', error);
                alert('CLV calculation failed: ' + error.message);
            }
        });
    }

    updateClvChartData(clvCategories: any): void {
        this.clvData.datasets[0].data = Object.values(clvCategories);
        this.clvData = { ...this.clvData }; // Trigger change detection for CLV chart
    }

    updateChurnChartData(response: any): void {
        this.churnData.datasets[0].data = [response.churnNo, response.churnYes];
        this.churnData = { ...this.churnData }; // Trigger chart update
    }

    loadPartialDependence(feature: string): void {
        if (this.file && feature) {
            this.predictionService.getPartialDependence(this.file, feature).subscribe({
                next: (response) => {
                    this.updatePartialDependenceChart(response);
                },
                error: (error) => {
                    console.error('Failed to load partial dependence:', error);
                }
            });
        } else {
            console.error('File not selected or feature not selected');
        }
    }

    updatePartialDependenceChart(data: any): void {
        this.partialDependenceData.labels = data.values;
        this.partialDependenceData.datasets[0].data = data.average_prediction;
        this.partialDependenceData = { ...this.partialDependenceData }; // Ensure chart updates
        this.partialoptions = {
            
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'selected feature'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'average prediction of churn'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'partial dependence of charges',
                    font: {
                        size: 18
                    }
                }
            }
        };
    }
    // Assuming fileData is your array of customer objects
    calculateTotalCharges(fileData: any[]): number {
        let totalCharges = 0;
        for (const customer of fileData) {
            if (customer.TotalCharges) {
                totalCharges += parseFloat(customer.TotalCharges);
            }
        }
        return totalCharges;
    }

    loadChargesData(file: File): void {
        const formData = new FormData();
        formData.append('file', file);
    
        this.http.post<any>('http://localhost:5001/charges-distribution', formData).subscribe(
            (data) => {
                console.log(data);
                // Update chart data with the charges data received from the server
                this.updateChargesChartData(data);
            },
            (error) => {
                console.error('Failed to load charges data:', error);
                alert('Failed to load charges data: ' + error.message);
            }
        );
    }
    
    

    updateChargesChartData(data: any): void {
        // Update chart data for monthly and total charges based on data received from the server
        const churnedMonthlyCharges = data.churned_monthly_charges;
        const retainedMonthlyCharges = data.retained_monthly_charges;
        const churnedTotalCharges = data.churned_total_charges;
        const retainedTotalCharges = data.retained_total_charges;
    
        // Prepare data for the histogram
        const churnedMonthlyData = this.prepareHistogramData(churnedMonthlyCharges);
        const retainedMonthlyData = this.prepareHistogramData(retainedMonthlyCharges);
        const churnedTotalData = this.prepareHistogramData(churnedTotalCharges);
        const retainedTotalData = this.prepareHistogramData(retainedTotalCharges);
    
        // Update chart data
        this.data = {
            labels: this.generateHistogramLabels(20, 6000, 100), // Example labels, adjust as needed
            datasets: [
                {
                    label: 'Churned Monthly Charges',
                    data: churnedMonthlyData,
                    backgroundColor: churnedMonthlyData.map(() => 'rgba(255, 99, 132, 0.2)'),
                    borderColor: churnedMonthlyData.map(() => 'rgba(255, 99, 132, 1)'),
                    borderWidth: 1
                },
                {
                    label: 'Retained Monthly Charges',
                    data: retainedMonthlyData,
                    backgroundColor: retainedMonthlyData.map(() => 'rgba(54, 162, 235, 0.2)'),
                    borderColor: retainedMonthlyData.map(() => 'rgba(54, 162, 235, 1)'),
                    borderWidth: 1
                },
                {
                    label: 'Churned Total Charges',
                    data: churnedTotalData,
                    backgroundColor: churnedTotalData.map(() => 'rgba(255, 159, 64, 0.2)'),
                    borderColor: churnedTotalData.map(() => 'rgba(255, 159, 64, 1)'),
                    borderWidth: 1
                },
                {
                    label: 'Retained Total Charges',
                    data: retainedTotalData,
                    backgroundColor: retainedTotalData.map(() => 'rgba(75, 192, 192, 0.2)'),
                    borderColor: retainedTotalData.map(() => 'rgba(75, 192, 192, 1)'),
                    borderWidth: 1
                }
            ]
        };
    
        // Update chart options
        this.options = {
            
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Charges'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency of churn'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Churn Rate by Charges',
                    font: {
                        size: 18
                    }
                }
            }
        };
    }
    
    prepareHistogramData(charges: number[]): number[] {
        // Example function to prepare histogram data, you can adjust as needed
        const bins = this.generateBins(charges);
        const counts = Array(bins.length - 1).fill(0);
        charges.forEach(charge => {
            for (let i = 0; i < bins.length - 1; i++) {
                if (charge >= bins[i] && charge < bins[i + 1]) {
                    counts[i]++;
                    break;
                }
            }
        });
        return counts;
    }
    
    generateBins(charges: number[]): number[] {
        // Example function to generate bins dynamically, adjust as needed
        const minCharge = Math.min(...charges);
        const maxCharge = Math.max(...charges);
        const binWidth = 20; // Example bin width, adjust as needed
        const numBins = Math.ceil((maxCharge - minCharge) / binWidth);
        const bins = Array.from({ length: numBins + 1 }, (_, i) => minCharge + i * binWidth);
        return bins;
    }
    
    generateHistogramLabels(min: number, max: number, binSize: number): string[] {
        // Example function to generate labels, adjust as needed
        const labels = [];
        for (let i = min; i <= max; i += binSize) {
            labels.push(`${i}-${i + binSize}`);
        }
        return labels;
    }
    
  showInfo() {
    alert("Explanation of partial dependence...");
  }
 
    
    
    
    
}    