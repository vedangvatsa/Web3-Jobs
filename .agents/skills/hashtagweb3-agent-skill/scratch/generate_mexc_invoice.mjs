import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

async function generateInvoice() {
  console.log("📄 Regenerating MEXC Invoice on Desktop (Removing $0.00 Discount line)...");
  
  try {
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    const docWidth = doc.internal.pageSize.getWidth();
    const contentWidth = docWidth - margin * 2;
    let y = margin;

    // Load Logo from Downloads and convert to Base64
    const logoPath = "/Users/vedang/Downloads/hashtag web3 logo.png";
    let logoHeight = 0;
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      const logoUri = `data:image/png;base64,${logoBase64}`;
      
      // Since it is 2400x2400 (square), render as 50x50 to preserve 1:1 aspect ratio
      doc.addImage(logoUri, 'PNG', margin, y, 50, 50);
      logoHeight = 50;
    } else {
      // Fallback to text header if logo is missing
      doc.setFontSize(20).setFont('helvetica', 'bold').setTextColor(41, 106, 187);
      doc.text('Hashtag Web3', margin, y + 15);
      logoHeight = 20;
    }
    
    doc.setFontSize(26).setFont('helvetica', 'bold').setTextColor(29, 40, 58); // Gray-800
    doc.text('INVOICE', docWidth - margin, y + 10, { align: 'right'});
    
    const invoiceNumber = `INV-2026-0527`;
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100, 116, 139); // Muted-foreground
    doc.text(`#${invoiceNumber}`, docWidth - margin, y + 30, { align: 'right'});
    
    // Dynamic y spacing based on logo height to prevent overlap
    y += Math.max(logoHeight + 20, 60);

    // From & To
    const infoY = y;
    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(100, 116, 139);
    doc.text('From:', margin, y);
    doc.setFont('helvetica', 'normal').setTextColor(0,0,0);
    doc.setFont('helvetica', 'bold');
    doc.text('Hashtag Web3', margin, y+=15);
    doc.setFont('helvetica', 'normal');
    doc.text('Level 39, Marina Bay Financial Centre Tower 2', margin, y+=12);
    doc.text('10 Marina Boulevard', margin, y+=12);
    doc.text('Singapore 018983', margin, y+=12);
    doc.text('hi@hashtagweb3.com', margin, y+=12);
    
    let fromYEnd = y;
    y = infoY;
    doc.setFont('helvetica', 'bold').setTextColor(100, 116, 139);
    doc.text('Bill To:', docWidth - margin, y, { align: 'right'});
    doc.setFont('helvetica', 'normal').setTextColor(0,0,0);
    doc.setFont('helvetica', 'bold');
    doc.text('MEXC', docWidth - margin, y+=15, { align: 'right'});
    doc.setFont('helvetica', 'normal');
    doc.text('Attn: Danny D', docWidth - margin, y+=12, { align: 'right'});
    doc.text('danny.d@mexc.com', docWidth - margin, y+=12, { align: 'right'});

    y = Math.max(y, fromYEnd) + 40;
    
    // Dates
    const dateY = y;
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(100, 116, 139);
    doc.text('Issue Date', margin, y);
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(0,0,0);
    doc.text('May 27, 2026', margin, y += 15);

    y = dateY;
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(100, 116, 139);
    doc.text('Due Date', docWidth - margin, y, { align: 'right'});
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(0,0,0);
    doc.text('June 10, 2026 (Net 14)', docWidth - margin, y+=15, { align: 'right'});
    y += 30;

    // Table Header
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 25, 'F');
    y += 18;
    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(51, 65, 85);
    doc.text('Description', margin + 10, y);
    doc.text('Qty', docWidth - margin - 150, y, { align: 'center'});
    doc.text('Rate', docWidth - margin - 90, y, { align: 'right'});
    doc.text('Total', docWidth - margin - 10, y, { align: 'right'});
    y += 7;
    
    // Table Body
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(0,0,0);
    
    // Line Item
    y+=5;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, docWidth - margin, y);
    y+=15;
    doc.text('Job postings', margin + 10, y);
    doc.text('25', docWidth - margin - 150, y, { align: 'center'});
    doc.text('$60.00', docWidth - margin - 90, y, { align: 'right'});
    doc.text('$1,500.00', docWidth - margin - 10, y, { align: 'right'});
    y += 15;
    
    doc.line(margin, y, docWidth - margin, y);
    y += 20;

    // Totals
    const totalsX = docWidth - margin - 200;
    const addTotalLine = (label, value) => {
      doc.setFont('helvetica', 'normal');
      doc.text(label, totalsX, y, { align: 'left'});
      doc.text(value, docWidth - margin, y, { align: 'right'});
      y += 18;
    };
    
    doc.setFontSize(10);
    addTotalLine('Subtotal:', '$1,500.00');
    
    y += 5;
    doc.setDrawColor(29, 40, 58);
    doc.line(totalsX - 10, y, docWidth - margin, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Due:', totalsX, y, { align: 'left' });
    doc.text('$1,500.00', docWidth - margin, y, { align: 'right' });
    y += 40;

    // Payment Methods (Crypto-Only)
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(0,0,0);
    doc.text('Payment Instructions (Cryptocurrency):', margin, y);
    y += 15;
    
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(100, 116, 139);
    doc.text('Please use this ETH / USDC / USDT (ERC-20) address for payment:', margin, y);
    
    y += 15;
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(29, 40, 58);
    doc.text('0xe249f9c23721f30F975e38Ac19848B3268fABd3C', margin, y);
    

    doc.setFontSize(8).setTextColor(156, 163, 175);
    doc.text('Generated with Hashtag Web3\'s Free Invoice Generator', docWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center'});

    // Save directly to user's Desktop
    const outputPath = "/Users/vedang/Desktop/mexc_invoice.pdf";
    const pdfData = doc.output('arraybuffer');
    fs.writeFileSync(outputPath, Buffer.from(pdfData));
    console.log(`✅ Invoice PDF successfully generated at: ${outputPath}`);
  } catch (e) {
    console.error("❌ Failed to generate PDF:", e.message);
  }
}

generateInvoice();
