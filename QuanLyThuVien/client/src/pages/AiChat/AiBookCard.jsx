import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

const AiBookCard = ({ book }) => {
    const img = Array.isArray(book.coverImage) ? book.coverImage[0] : book.coverImage;

    return (
        <Link to={`/books/${book.id}`} target="_blank"
            className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer no-underline">
            {/* Cover */}
            <div className="h-40 w-full bg-gray-50 overflow-hidden relative shrink-0">
                {img
                    ? <img src={img} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={36} className="text-gray-200" />
                    </div>
                }
                {/* Badge */}
                <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${book.availableQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {book.availableQuantity > 0 ? 'Có sẵn' : 'Hết sách'}
                </div>
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col flex-1">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{book.title}</h4>
                {book.authors && <p className="text-xs text-gray-400 mt-1 truncate">{book.authors}</p>}
                <div className="mt-auto pt-3 flex items-center justify-between">
                    {book.price
                        ? <span className="font-bold text-sm" style={{ color: '#a30014' }}>{Number(book.price).toLocaleString('vi-VN')}đ</span>
                        : <span className="text-xs text-gray-400">Miễn phí</span>
                    }
                    <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-red-700 group-hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                        <ArrowRight size={13} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default AiBookCard;
