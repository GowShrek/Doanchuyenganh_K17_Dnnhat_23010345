import React, { useRef } from 'react';
import { Modal } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, Download, ExternalLink } from 'lucide-react';

/**
 * BookQRCode — hiển thị QR code cho một cuốn sách trong modal
 *
 * Props:
 *  open    {boolean}
 *  onClose {Function}
 *  book    { id, title, isbn, coverImage, authors }
 */
const BookQRCode = ({ open, onClose, book }) => {
    const printRef = useRef(null);

    if (!book) return null;

    const bookUrl = `${window.location.origin}/books/${book.id}`;
    const coverImg = Array.isArray(book.coverImage) ? book.coverImage[0] : book.coverImage;
    const authorName = book.authors?.map(a => a.penName || a.fullName).join(', ') || '';

    // ── In QR ────────────────────────────────────────────────────
    const handlePrint = () => {
        const win = window.open('', '_blank');
        const svgEl = printRef.current?.querySelector('svg');
        if (!svgEl) return;

        const svgStr = new XMLSerializer().serializeToString(svgEl);
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR - ${book.title}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; background: #fff; }
                    .card { text-align: center; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; max-width: 340px; }
                    .card img.cover { width: 80px; height: 112px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; }
                    .card h2 { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 4px; line-height: 1.4; }
                    .card p  { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
                    .card .isbn { font-family: monospace; font-size: 11px; color: #9ca3af; }
                    .qr { margin: 16px auto; }
                    .url { font-size: 10px; color: #6b7280; margin-top: 8px; word-break: break-all; }
                    .brand { margin-top: 16px; font-size: 12px; font-weight: 700; color: #a30014; letter-spacing: 0.05em; }
                    @media print { body { -webkit-print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="card">
                    ${coverImg ? `<img class="cover" src="${coverImg}" alt="" />` : ''}
                    <h2>${book.title}</h2>
                    ${authorName ? `<p>${authorName}</p>` : ''}
                    ${book.isbn ? `<p class="isbn">ISBN: ${book.isbn}</p>` : ''}
                    <div class="qr">${svgStr}</div>
                    <p class="url">${bookUrl}</p>
                    <p class="brand">Thư Viện Số</p>
                </div>
            </body>
            </html>
        `);
        win.document.close();
        setTimeout(() => { win.focus(); win.print(); win.close(); }, 300);
    };

    // ── Tải SVG ──────────────────────────────────────────────────
    const handleDownload = () => {
        const svgEl = printRef.current?.querySelector('svg');
        if (!svgEl) return;
        const svgStr = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QR-${book.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <div className="flex items-center gap-2 py-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
                        <QrCode size={16} className="text-gray-700" />
                    </div>
                    <span className="font-bold text-gray-900">Mã QR sách</span>
                </div>
            }
            footer={null}
            destroyOnClose
            width={400}
        >
            <div className="mt-4 flex flex-col items-center gap-5">
                {/* Book info */}
                <div className="flex items-start gap-3 w-full p-3 rounded-xl bg-gray-50">
                    {coverImg && (
                        <img src={coverImg} alt="" className="w-10 h-14 object-cover rounded-lg shrink-0" />
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{book.title}</p>
                        {authorName && <p className="text-xs text-gray-500 mt-0.5">{authorName}</p>}
                        {book.isbn && <p className="text-xs text-gray-400 font-mono mt-0.5">ISBN: {book.isbn}</p>}
                    </div>
                </div>

                {/* QR code */}
                <div ref={printRef} className="p-4 rounded-2xl border-2 border-gray-100 bg-white shadow-inner">
                    <QRCodeSVG
                        value={bookUrl}
                        size={200}
                        level="M"
                        includeMargin={true}
                        style={{ display: 'block' }}
                    />
                </div>

                {/* URL */}
                <p className="text-xs text-gray-400 text-center break-all px-2">{bookUrl}</p>

                {/* Actions */}
                <div className="flex gap-2 w-full">
                    <a href={bookUrl} target="_blank" rel="noreferrer"
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                        <ExternalLink size={13} /> Mở trang
                    </a>
                    <button onClick={handleDownload}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                        <Download size={13} /> Tải SVG
                    </button>
                    <button onClick={handlePrint}
                        className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#a30014' }}>
                        <Printer size={13} /> In QR
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BookQRCode;
