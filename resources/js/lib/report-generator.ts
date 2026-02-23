import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../../public/Logo/LogoGray.png';

// --- Interfaces (sin cambios) ---
interface Donation {
    id: number;
    donor_name: string;
    amount: string;
    created_at: string;
    shelter?: {
        name: string;
    };
}

interface User {
    name: string;
    role: 'cliente' | 'aliado' | 'admin';
    shelter?: {
        name: string;
    };
}

export const generateDonationsReport = (donations: Donation[], user: User) => {
    const doc = new jsPDF();
    let tableColumns: string[] = [];
    const tableRows: string[][] = [];
    let reportTitle = 'Reporte de Donaciones';

    const reportDate = new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // --- Definición de datos (sin cambios) ---
    switch (user.role) {
        case 'cliente':
            reportTitle = `Mis Donaciones - ${user.name}`;
            tableColumns = ['Fundación', 'Monto', 'Fecha'];
            donations.forEach((d) =>
                tableRows.push([
                    d.shelter?.name ?? 'N/A',
                    `$${d.amount ? parseFloat(d.amount).toLocaleString('es-CO') : '0'}`,
                    new Date(d.created_at).toLocaleDateString('es-CO'),
                ]),
            );
            break;

        case 'aliado':
            reportTitle = `Donaciones Recibidas - ${user.shelter?.name}`;
            tableColumns = ['Donante', 'Monto', 'Fecha'];
            donations.forEach((d) =>
                tableRows.push([
                    d.donor_name,
                    `$${d.amount ? parseFloat(d.amount).toLocaleString('es-CO') : '0'}`,
                    new Date(d.created_at).toLocaleDateString('es-CO'),
                ]),
            );
            break;

        default: // admin
            reportTitle = 'Reporte General de Donaciones';
            tableColumns = ['Donante', 'Fundación', 'Monto', 'Fecha'];
            donations.forEach((d) =>
                tableRows.push([
                    d.donor_name,
                    d.shelter?.name ?? 'N/A',
                    `$${d.amount ? parseFloat(d.amount).toLocaleString('es-CO') : '0'}`,
                    new Date(d.created_at).toLocaleDateString('es-CO'),
                ]),
            );
            break;
    }

    // --- Función para añadir Encabezado y Pie de Página (MODIFICADA) ---
    const addHeaderAndFooter = (data: unknown) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // --- Marca de Agua ---
        doc.saveGraphicsState();
        doc.setGState(new (doc as unknown as { GState: new (options: { opacity: number }) => unknown }).GState({ opacity: 0.1 }));
        doc.addImage(logo, 'PNG', pageWidth / 2 - 40, pageHeight / 2 - 25, 80, 50, undefined, 'FAST');
        doc.restoreGraphicsState();

        // --- Títulos ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(reportTitle, 14, 20);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40);
        doc.text(`Generado el: ${reportDate}`, 14, 28);

        // --- Pie de Página con Leyenda Mejorada ---
        const pageNumber = `Página ${(data as { pageNumber?: number }).pageNumber || 1} de ${doc.internal.pages.length}`;

        // Solo muestra la leyenda para los donantes (rol 'cliente')
        if (user.role === 'cliente') {
            const legend =
                'Certificado de donación para descuento tributario del 25% en renta (Art. 125, Estatuto Tributario). Consulte a su contador.';
            doc.setFontSize(7.5);
            doc.setTextColor(180); // Un gris más claro
            doc.text(legend, pageWidth / 2, pageHeight - 15, { align: 'center' });
        }

        doc.setFontSize(8);
        doc.setTextColor(150); // Aclarado también para consistencia
        doc.text(pageNumber, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    // --- Crear el PDF con autoTable ---
    autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [22, 160, 133],
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        didDrawPage: addHeaderAndFooter,
        margin: { top: 35 },
    });

    // --- Bucle para corregir la paginación final ---
    const totalPages = doc.internal.pages.length;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        // Llama a la función de pie de página nuevamente para asegurar el conteo total correcto
        addHeaderAndFooter({ pageNumber: i } as unknown);
    }

    doc.save(`reporte_donaciones_${user.role}.pdf`);
};
