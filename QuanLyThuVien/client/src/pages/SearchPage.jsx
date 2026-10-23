import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Select, Slider, Empty, Spin } from 'antd';
import { Search, SlidersHorizontal, X, BookOpen, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { requestGetBooks } from '../config/bookRequest';
import { requestGetCategories } from '../config/categoryRequest';
import { requestGetGenres } from '../config/genreRequest';
import { requestGetPublishers } from '../config/publisherRequest';

const { Option } = Select;
const LIMIT = 16;
const CURRENT_YEAR = new Date().getFullYear();

// ── Book Card ─────────────────────────────────────────────────────
const BookCard = ({ book, onClick }) => {
    const img = Array.isArray(book.coverImage) ? book.coverImage[0] : book.coverImage;
    const available = book.availableQuantity > 0;

    return (
        <div onClick={onClick}
            className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer">
            <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '2/3' }}>
                {img
                    ? <img src={img} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen size={28} className="text-gray-200" /></div>
                }
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${available ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {available ? 'Còn sách' : 'Hết'}
                </span>
                {book.genres?.[0] && (
                    <span className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium truncate max-w-[80%]"
                        style={{ backgroundColor: book.genres[0].color || '#a30014' }}>
                        {book.genres[0].name}
                    </span>
                )}
            </div>
            <div className="p-3 flex-1 flex flex-col gap-1">
                <p className="text-[11px] text-gray-400 truncate">{book.authors?.map(a => a.fullName).join(', ') || '—'}</p>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">{book.title}</h3>
                <div className="mt-auto flex items-center justify-between pt-1">
                    {book.publishYear && <span className="text-[10px] text-gray-400">{book.publishYear}</span>}
                    <span className="text-[10px] text-gray-400 ml-auto">{book.availableQuantity}/{book.totalQuantity} bản</span>
                </div>
            </div>
        </div>
    );
};

// ── Filter Panel ──────────────────────────────────────────────────
const FilterPanel = ({ filters, setFilters, categories, genres, publishers, onReset, isMobile, onClose }) => {
    const activeCount = [
        filters.categoryId, filters.genreId, filters.publisherId,
        filters.available, filters.yearFrom > 1900 || filters.yearTo < CURRENT_YEAR,
    ].filter(Boolean).length;

    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5 ${isMobile ? '' : 'sticky top-20'}`}>
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Filter size={16} style={{ color: '#a30014' }} /> Bộ lọc
                    {activeCount > 0 && (
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#a30014' }}>{activeCount}</span>
                    )}
                </h3>
                {activeCount > 0 && (
                    <button onClick={onReset} className="text-xs text-red-600 hover:underline flex items-center gap-1">
                        <X size={12} /> Xóa bộ lọc
                    </button>
                )}
                {isMobile && <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>}
            </div>

            {/* Danh mục */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Danh mục</label>
                <Select value={filters.categoryId || undefined} onChange={v => setFilters(f => ({ ...f, categoryId: v || '', page: 1 }))}
                    allowClear placeholder="Tất cả danh mục" className="w-full" size="middle">
                    {categories.map(c => <Option key={c.id} value={String(c.id)}>{c.name}</Option>)}
                </Select>
            </div>

            {/* Thể loại */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Thể loại</label>
                <Select value={filters.genreId || undefined} onChange={v => setFilters(f => ({ ...f, genreId: v || '', page: 1 }))}
                    allowClear placeholder="Tất cả thể loại" className="w-full" size="middle">
                    {genres.map(g => (
                        <Option key={g.id} value={String(g.id)}>
                            <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color || '#ccc' }} />
                                {g.name}
                            </span>
                        </Option>
                    ))}
                </Select>
            </div>

            {/* Nhà xuất bản */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nhà xuất bản</label>
                <Select value={filters.publisherId || undefined} onChange={v => setFilters(f => ({ ...f, publisherId: v || '', page: 1 }))}
                    allowClear placeholder="Tất cả NXB" className="w-full" size="middle" showSearch
                    filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}>
                    {publishers.map(p => <Option key={p.id} value={String(p.id)}>{p.name}</Option>)}
                </Select>
            </div>

            {/* Năm xuất bản */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Năm xuất bản: <span className="text-gray-700 font-bold">{filters.yearFrom} — {filters.yearTo}</span>
                </label>
                <Slider range min={1900} max={CURRENT_YEAR} value={[filters.yearFrom, filters.yearTo]}
                    onChange={([from, to]) => setFilters(f => ({ ...f, yearFrom: from, yearTo: to, page: 1 }))}
                    trackStyle={[{ backgroundColor: '#a30014' }]}
                    handleStyle={[{ borderColor: '#a30014' }, { borderColor: '#a30014' }]}
                />
            </div>

            {/* Chỉ hiện sách còn */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div onClick={() => setFilters(f => ({ ...f, available: !f.available, page: 1 }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${filters.available ? 'bg-red-700' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">Chỉ sách còn để mượn</span>
            </label>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────
const SearchPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [books, setBooks] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [categories, setCategories] = useState([]);
    const [genres, setGenres] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [inputVal, setInputVal] = useState(searchParams.get('q') || '');

    const [filters, setFilters] = useState({
        search: searchParams.get('q') || '',
        categoryId: searchParams.get('categoryId') || '',
        genreId: searchParams.get('genreId') || '',
        publisherId: searchParams.get('publisherId') || '',
        yearFrom: Number(searchParams.get('yearFrom')) || 1900,
        yearTo: Number(searchParams.get('yearTo')) || CURRENT_YEAR,
        available: searchParams.get('available') === 'true',
        sortBy: searchParams.get('sortBy') || 'newest',
        page: Number(searchParams.get('page')) || 1,
    });

    // Load dropdown data
    useEffect(() => {
        Promise.all([
            requestGetCategories({ limit: 100 }),
            requestGetGenres({ limit: 100 }),
            requestGetPublishers({ limit: 200 }),
        ]).then(([cat, gen, pub]) => {
            setCategories(cat.metadata?.categories || cat.metadata || []);
            setGenres(gen.metadata?.genres || gen.metadata || []);
            setPublishers(pub.metadata?.publishers || pub.metadata || []);
        }).catch(() => {});
    }, []);

    // Sync filters → URL params
    useEffect(() => {
        const params = {};
        if (filters.search) params.q = filters.search;
        if (filters.categoryId) params.categoryId = filters.categoryId;
        if (filters.genreId) params.genreId = filters.genreId;
        if (filters.publisherId) params.publisherId = filters.publisherId;
        if (filters.yearFrom !== 1900) params.yearFrom = filters.yearFrom;
        if (filters.yearTo !== CURRENT_YEAR) params.yearTo = filters.yearTo;
        if (filters.available) params.available = 'true';
        if (filters.sortBy !== 'newest') params.sortBy = filters.sortBy;
        if (filters.page !== 1) params.page = filters.page;
        setSearchParams(params, { replace: true });
    }, [filters]);

    // Fetch books
    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                search: filters.search || undefined,
                categoryId: filters.categoryId || undefined,
                genreId: filters.genreId || undefined,
                publisherId: filters.publisherId || undefined,
                yearFrom: filters.yearFrom !== 1900 ? filters.yearFrom : undefined,
                yearTo: filters.yearTo !== CURRENT_YEAR ? filters.yearTo : undefined,
                available: filters.available ? 'true' : undefined,
                sortBy: filters.sortBy,
                isActive: 'true',
                page: filters.page,
                limit: LIMIT,
            };
            const res = await requestGetBooks(params);
            setBooks(res.metadata?.books || []);
            setTotal(res.metadata?.total || 0);
        } catch { }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { fetchBooks(); }, [fetchBooks]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(f => ({ ...f, search: inputVal, page: 1 }));
    };

    const resetFilters = () => {
        setFilters({ search: '', categoryId: '', genreId: '', publisherId: '', yearFrom: 1900, yearTo: CURRENT_YEAR, available: false, sortBy: 'newest', page: 1 });
        setInputVal('');
    };

    const totalPages = Math.ceil(total / LIMIT);
    const activeFilterCount = [filters.categoryId, filters.genreId, filters.publisherId, filters.available, filters.yearFrom > 1900 || filters.yearTo < CURRENT_YEAR].filter(Boolean).length;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header />

            {/* Search Hero */}
            <div className="border-b border-gray-100 bg-white py-6 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-xl font-bold text-gray-900 mb-3">Tìm kiếm sách</h1>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={inputVal} onChange={e => setInputVal(e.target.value)}
                                placeholder="Nhập tên sách, ISBN, tác giả..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm"
                                style={{ '--tw-ring-color': '#fecaca' }}
                            />
                        </div>
                        <button type="submit"
                            className="px-6 py-3 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
                            style={{ backgroundColor: '#a30014' }}>
                            Tìm kiếm
                        </button>
                        {/* Mobile filter toggle */}
                        <button type="button" onClick={() => setShowFilter(v => !v)}
                            className={`lg:hidden px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition-colors ${activeFilterCount > 0 ? 'border-red-300 text-red-700 bg-red-50' : 'border-gray-200 text-gray-600 bg-white'}`}>
                            <SlidersHorizontal size={16} />
                            {activeFilterCount > 0 && <span className="text-xs bg-red-700 text-white rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
                        </button>
                    </form>

                    {/* Result summary */}
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                        <span>
                            {loading ? 'Đang tìm...' : (
                                <>
                                    <span className="font-semibold text-gray-900">{total}</span> kết quả
                                    {filters.search && <> cho "<span className="font-semibold text-gray-900">{filters.search}</span>"</>}
                                </>
                            )}
                        </span>
                        <Select value={filters.sortBy} onChange={v => setFilters(f => ({ ...f, sortBy: v, page: 1 }))}
                            size="small" style={{ width: 160 }} bordered={false} className="text-xs">
                            <Option value="newest">Mới nhất</Option>
                            <Option value="title">Tên A-Z</Option>
                            <Option value="year_desc">Năm XB mới nhất</Option>
                            <Option value="year_asc">Năm XB cũ nhất</Option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto w-full px-4 py-6 flex-1">
                <div className="flex gap-6">
                    {/* Filter sidebar */}
                    <aside className="hidden lg:block w-56 shrink-0">
                        <FilterPanel
                            filters={filters} setFilters={setFilters}
                            categories={categories} genres={genres} publishers={publishers}
                            onReset={resetFilters}
                        />
                    </aside>

                    {/* Mobile filter drawer */}
                    {showFilter && (
                        <div className="fixed inset-0 z-50 flex lg:hidden">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilter(false)} />
                            <div className="relative ml-auto w-80 h-full bg-transparent overflow-y-auto p-4 pt-16">
                                <FilterPanel isMobile filters={filters} setFilters={setFilters}
                                    categories={categories} genres={genres} publishers={publishers}
                                    onReset={resetFilters} onClose={() => setShowFilter(false)} />
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {Array.from({ length: LIMIT }).map((_, i) => (
                                    <div key={i} className="rounded-xl bg-gray-100 animate-pulse" style={{ aspectRatio: '2/3' }} />
                                ))}
                            </div>
                        ) : books.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Empty description={
                                    <span className="text-gray-400 text-sm">
                                        {filters.search ? `Không tìm thấy sách phù hợp với "${filters.search}"` : 'Không có sách phù hợp với bộ lọc'}
                                    </span>
                                } />
                                {activeFilterCount > 0 && (
                                    <button onClick={resetFilters} className="mt-4 text-sm text-red-600 hover:underline">Xóa bộ lọc và thử lại</button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {books.map(book => (
                                    <BookCard key={book.id} book={book} onClick={() => navigate(`/books/${book.id}`)} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
                                    disabled={filters.page === 1}
                                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let p;
                                    if (totalPages <= 7) p = i + 1;
                                    else if (filters.page <= 4) p = i + 1;
                                    else if (filters.page >= totalPages - 3) p = totalPages - 6 + i;
                                    else p = filters.page - 3 + i;
                                    return (
                                        <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${p === filters.page ? 'text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                            style={p === filters.page ? { backgroundColor: '#a30014' } : {}}>
                                            {p}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                                    disabled={filters.page === totalPages}
                                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SearchPage;
