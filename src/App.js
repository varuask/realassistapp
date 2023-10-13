import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './App.css';
import constants from './constant';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [pdfGenStatus, setPdfGenStatus] = useState(null);

  const chartRef = useRef(null);

  const setInitialLayout = () => {
    const doc = new jsPDF();
    doc.setLineWidth(0.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(constants.pdfLeftHeader, 10, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
      constants.pdfRightHeader,
      doc.internal.pageSize.getWidth() - 10,
      20,
      { align: 'right' }
    );

    doc.line(10, 25, doc.internal.pageSize.getWidth() - 10, 25);

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 255);
      doc.text(
        `Report generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        10,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(
        `RealAssist Property Report | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 10,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }

    const lineColors = [
      [148, 0, 211],
      [75, 0, 130],
      [0, 0, 255],
    ];

    const lineWidth = doc.internal.pageSize.getWidth() - 20;
    const lineHeight = 0.5;
    let startX = 10;
    const startY = doc.internal.pageSize.getHeight() - 15;

    for (let j = 0; j < lineColors.length; j++) {
      const [r, g, b] = lineColors[j];
      const endX = startX + lineWidth / lineColors.length;
      const endY = startY;

      doc.setLineWidth(lineHeight);
      doc.setDrawColor(r, g, b);
      doc.line(startX, startY, endX, endY);

      startX += lineWidth / lineColors.length;
    }

    doc.line(10, 25, doc.internal.pageSize.getWidth() - 10, 25);
    return doc;
  };

  const generatePDF = () => {
    const doc = setInitialLayout();
    const chartContainer = document.querySelector('.chart-container');
    html2canvas(chartContainer, { scale: 5 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        const margin = 10;
        const footerHeight = 15;
        const graphHeight = pdfHeight * 0.6;

        const graphWidth = pdfWidth * 0.9;
        const graphX = margin;
        const graphY = pdfHeight - margin - footerHeight - graphHeight + 175;

        doc.addImage(imgData, 'JPEG', graphX, graphY, graphWidth, graphHeight);
        doc.save('report.pdf');
        chartContainer.style.display = 'none';
        window.location.reload();
      })
      .catch((error) => {
        chartContainer.style.display = 'none';
        setPdfGenStatus('pdf-gen-failed');
      });
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('state', 'AK');
      params.append('from', 2012);
      params.append('to', 2022);
      const url = `${constants.backendUrl}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      setGraphData({
        labels: data.map((val) => val.data_year),
        datasets: [
          {
            label: 'Burglary',
            data: data.map((val) => val.Burglary),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      });
    } catch (error) {
      setRequestStatus('failure');
    }
    setLoading(false);
  };

  const options = constants.graphOptions;

  useEffect(() => {
    if (graphData) {
      const printButton = document.querySelector('.print-button');
      printButton.style.display = 'none';
      const delay = setTimeout(() => {
        generatePDF();
        clearTimeout(delay);
      }, 1000);
    }
  }, [graphData]);

  return (
    <div className="App">
      <button className="print-button" onClick={handleClick} disabled={loading}>
        {loading ? 'Printing PDF...' : 'Print'}
      </button>
      {requestStatus === 'failure' && (
        <div className="error-message">
          An error occurred while fetching data. Please try again later.
        </div>
      )}
      {graphData && (
        <div className="chart-container">
          <div className="chart-header">
            <div className="arrest-heading">Arrests</div>
          </div>
          <div ref={chartRef} className="actual-graph">
            <Line data={graphData} options={options} />
          </div>
        </div>
      )}
      {pdfGenStatus === 'pdf-gen-failed' && (
        <div className="error-message">
          Failed to generate PDF. Please try again later.
        </div>
      )}
    </div>
  );
}
