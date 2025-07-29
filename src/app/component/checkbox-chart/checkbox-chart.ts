import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChartType, ChartConfiguration } from 'chart.js';
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-checkbox-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './checkbox-chart.html',
  styleUrl: './checkbox-chart.css'
})
export class CheckboxChart {
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Số lượt click theo checkbox và theo tháng'
      }
    }
  };

  public barChartType: ChartType = 'bar';

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [], // months
    datasets: [] // each checkbox = 1 dataset
  };

  constructor(private http: HttpClient) {
    this.loadMonthlyStats();
  }

  loadMonthlyStats() {
    this.http.get<any[]>('https://localhost:7035/api/CheckboxClicks/stats/monthly-by-checkbox')
      .subscribe(data => {
        const groupedData: { [checkbox: string]: { [month: string]: number } } = {};
        const allMonthsSet: Set<string> = new Set();

        // Gom nhóm dữ liệu
        data.forEach(item => {
          const checkbox = item.checkbox;
          const month = `${item.year}-${String(item.month).padStart(2, '0')}`;
          allMonthsSet.add(month);

          if (!groupedData[checkbox]) {
            groupedData[checkbox] = {};
          }

          groupedData[checkbox][month] = item.clicks;
        });

        // Sắp xếp tháng
        const sortedMonths = Array.from(allMonthsSet).sort();

        // Tạo dữ liệu cho từng checkbox
        const datasets = Object.keys(groupedData).map(checkbox => {
          const data = sortedMonths.map(month => groupedData[checkbox][month] || 0);
          return {
            label: checkbox,
            data: data
          };
        });

        this.barChartData.labels = sortedMonths;
        this.barChartData.datasets = datasets;
      });
  }
}
