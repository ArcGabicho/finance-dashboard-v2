const setModeBtn = document.querySelector('.set-mode-btn');
const closeAsideBtn = document.querySelector('.close-aside-btn');
const showAsideBtn = document.querySelector('.show-aside-btn');
const asideElement = document.querySelector('.aside');

setModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }

  updateChartColors();
});

let localTheme = localStorage.getItem('theme');

if (localTheme === 'dark') {
  document.body.classList.add('dark-mode');
}
else {
  document.body.classList.remove('dark-mode');
}

showAsideBtn.addEventListener('click', () => {
  if (!showAsideBtn) return;
  asideElement.classList.add('show');
});

closeAsideBtn.addEventListener('click', () => {
  if (!closeAsideBtn) return;
  asideElement.classList.remove('show');
});

const chart1 = document.querySelector('.chart1');
const chart2 = document.querySelector('.chart2');
const chart3 = document.querySelector('.chart3');
const chart4 = document.querySelector('.chart4');

let chartsInstances = [];

function charts() {
  const textColor = document.body.classList.contains('dark-mode') ? '#ffffff' : '#000000';
  const gridColor = document.body.classList.contains('dark-mode') ? '#444444' : '#e0e0e0';

  const chartA = new Chart(chart1, {
    type: 'bar',
    data: {
      labels: ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports', 'Other'],
      datasets: [{
        label: 'Total Sales ($)',
        data: [12000, 9500, 7800, 4300, 6500, 2500],
        backgroundColor: '#3498db',
        borderRadius: 6
      }]
    },
    options: {
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      },
      plugins: {
        legend: { labels: { color: textColor } }
      }
    }
  });

  const chartB = new Chart(chart2, {
    type: 'polarArea',
    data: {
      labels: ['Marketing', 'Salaries', 'Operations', 'Utilities', 'Supplies', 'Taxes'],
      datasets: [{
        backgroundColor: ['#1abc9c', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c'],
        data: [3000, 7000, 2500, 1000, 1500, 2000]
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: textColor } }
      }
    }
  });

  const chartC = new Chart(chart3, {
    type: 'doughnut',
    data: {
      labels: ['North America', 'Europe', 'Asia', 'Latin America', 'Africa'],
      datasets: [{
        label: 'Revenue ($)',
        backgroundColor: ['#2980b9', '#8e44ad', '#27ae60', '#f39c12', '#c0392b'],
        data: [5000, 3000, 4000, 2500, 1000]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Revenue Distribution by Region',
          color: textColor
        },
        legend: {
          labels: { color: textColor }
        }
      }
    }
  });

  const chartD = new Chart(chart4, {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Income ($)',
          backgroundColor: '#2ecc71',
          data: [15000, 18000, 21000, 25000]
        },
        {
          label: 'Expenses ($)',
          backgroundColor: '#e74c3c',
          data: [12000, 14000, 16000, 20000]
        }
      ]
    },
    options: {
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Quarterly Income vs Expenses',
          color: textColor
        },
        legend: { labels: { color: textColor } }
      }
    }
  });

  chartsInstances = [chartA, chartB, chartC, chartD];
}

function updateChartColors() {
  chartsInstances.forEach(chart => chart.destroy());
  charts();
}

charts();