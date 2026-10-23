import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Search, Star } from 'lucide-react';
import { requestGetBooks } from '../../config/bookRequest';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book, onClick }) => {
    const img = Array.isArray(book.coverImage) ? book.coverImage[0] : book.coverImage;
    const authors = book.authors?.map(a => a.fullName).join(', ') || '';
    const available = book.availableQuantity > 0;

    return (
        <div onClick={onClick}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer">
            {/* Cover */}
            <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '2/3' }}>
                {img ? (
                    <img src={img} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <BookOpen size={32} className="text-gray-200" />
                        <span className="text-xs text-gray-300">Chưa có ảnh</span>
                    </div>
                )}
                {/* Badge trạng thái */}
                <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${available ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {available ? 'Còn sách' : 'Hết sách'}
                </div>
                {/* Genre tags */}
                {book.genres?.length > 0 && (
                    <div className="absolute bottom-2 left-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                            style={{ backgroundColor: book.genres[0].color || '#a30014' }}>
                            {book.genres[0].name}
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-1 flex-1">
                <p className="text-xs text-gray-400 truncate">{authors || 'Chưa có tác giả'}</p>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">{book.title}</h3>
                {book.publisher && <p className="text-[11px] text-gray-400 truncate">{book.publisher.name}</p>}
                <div className="mt-auto pt-2 flex items-center justify-between">
                    {book.publishYear && <span className="text-[10px] text-gray-400">{book.publishYear}</span>}
                    <span className="text-[10px] text-gray-400 ml-auto">{book.availableQuantity}/{book.totalQuantity} bản</span>
                </div>
            </div>
        </div>
    );
};

const BookGrid = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [inputVal, setInputVal] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 12;

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetBooks({
                search: search || undefined,
                isActive: true,
                page,
                limit: LIMIT,
            });
            setBooks(res.metadata?.books || []);
            setTotal(res.metadata?.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => { fetchBooks(); }, [fetchBooks]);

    const totalPages = Math.ceil(total / LIMIT);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(inputVal);
        setPage(1);
    };

    return (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
                        {search ? `Kết quả tìm kiếm "${search}"` : 'Sách nổi bật'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {loading ? 'Đang tải...' : `${total} đầu sách`}
                    </p>
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            placeholder="Tìm tên sách, tác giả..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-red-300 transition-all"
                            style={{ '--tw-ring-color': '#fecaca' }}
                        />
                    </div>
                    <button type="submit"
                        className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#a30014' }}>
                        Tìm
                    </button>
                    {search && (
                        <button type="button" onClick={() => { setSearch(''); setInputVal(''); setPage(1); }}
                            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                            Xóa
                        </button>
                    )}
                </form>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: LIMIT }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse" style={{ aspectRatio: '2/3' }} />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Không tìm thấy sách phù hợp</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {books.map(book => <BookCard key={book.id} book={book} onClick={() => navigate(`/books/${book.id}`)} />)}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                        <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let p;
                        if (totalPages <= 7) p = i + 1;
                        else if (page <= 4) p = i + 1;
                        else if (page >= totalPages - 3) p = totalPages - 6 + i;
                        else p = page - 3 + i;
                        return (
                            <button key={p} onClick={() => setPage(p)}
                                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${p === page ? 'text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                style={p === page ? { backgroundColor: '#a30014' } : {}}>
                                {p}
                            </button>
                        );
                    })}

                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </section>
    );
};

export default BookGrid;
