import React, { useState, useRef } from 'react';
import { useTrips } from '../hooks/useTrips';


import MonthlyTable from '../components/MonthlyTable';
import TripTable from '../components/TripTable';
import TripForm from '../components/TripForm';
import { Truck, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import FleetDashboard from '../components/FleetDashboard';

const Dashboard = () => {
    const {
        trips, addTrip, deleteTrip, updateTrip, stats, yearlyStats,
        currentMonth, setCurrentMonth,
        currentYear, setCurrentYear,
        routePresets,
        cnDeductions, setCnDeductions,
        fetchPresets, fetchTrips,
        isSupabaseReady, currentMonthTripsEnriched, uploadFile
    } = useTrips();

    const [formDate, setFormDate] = useState(null);
    const [editingTrip, setEditingTrip] = useState(null);
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'all'
    const [isMaximized, setIsMaximized] = useState(false);
    const formRef = useRef(null);

    const handleEditTrip = (trip) => {
        setEditingTrip(trip);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleUpdateTrip = async (id, updatedData) => {
        await updateTrip(id, updatedData);
        setEditingTrip(null);
    };

    const handleExport = () => {
        const headers = ["วันที่", "คนขับ", "สายงาน", "ค่าเที่ยว", "น้ำมัน", "ค่าจ้าง", "ค่าซ่อม", "จำนวนตะกร้า", "ค่าตะกร้า", "ส่วนแบ่งตะกร้า", "ยอดเบิก", "กำไร"];
        const csvContent = [
            headers.join(","),
            ...currentMonthTripsEnriched.map(t => [
                t.date,
                `"${t.driverName}"`,
                `"${t.route}"`,
                t.price,
                t.fuel,
                t.wage,
                t.maintenance,
                t.basketCount,
                t.basket,
                t.basketShare,
                t.staffShare,
                t.profit
            ].join(","))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `fleet_data_${currentMonth + 1}_${currentYear}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const handleMonthChange = (direction) => {
        let newMonth = currentMonth + direction;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const handleSelectDate = (date) => {
        setFormDate({ value: date, ts: Date.now() });
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const [viewType, setViewType] = useState('monthly'); // 'monthly' or 'yearly' for stats

    const tripsArray = viewMode === 'monthly' ? currentMonthTripsEnriched : trips;

    const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    return (
        <FleetDashboard
            stats={stats}
            yearlyStats={yearlyStats}
            isSupabaseReady={isSupabaseReady}
            trips={trips}
            currentMonth={currentMonth}
            currentYear={currentYear}
            viewType={viewType}
            setViewType={setViewType}
            isMaximized={isMaximized}
        >
            <div className="header-flex-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="logo-group" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <img src="/logo-premium.png" alt="Patta Fleet Logo" style={{ height: '75px', width: 'auto', borderRadius: '14px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 className="brand-logo" style={{ fontSize: '2rem', margin: 0, lineHeight: '1.1' }}>Patta Fleet</h1>
                            <p className="brand-subtitle" style={{ margin: 0, letterSpacing: '0.6em', fontSize: '11px' }}>SOLUTION</p>
                        </div>
                    </div>

                    <div className="title-section">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                            ตารางสรุปงานขนส่ง
                        </h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                            การจัดการกองรถและผลประกอบการ
                        </p>
                    </div>

                    {/* Status Pill moved from FleetDashboard */}
                    <div className={`status-pill ${isSupabaseReady ? 'online' : 'offline'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: '700' }}>
                        <div className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSupabaseReady ? '#2dd4bf' : '#f43f5e', boxShadow: isSupabaseReady ? '0 0 10px #2dd4bf' : 'none' }} />
                        <span style={{ color: isSupabaseReady ? '#2dd4bf' : '#f43f5e' }}>
                            {isSupabaseReady ? `คลาวด์ออนไลน์ (${trips.length})` : 'ออฟไลน์'}
                        </span>
                    </div>

                    {/* Monthly/Yearly Switcher moved from FleetDashboard */}
                    <div className="view-switcher-glass" style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <button
                            className={`switch-btn ${viewType === 'monthly' ? 'active' : ''}`}
                            onClick={() => setViewType('monthly')}
                        >
                            รายเดือน
                        </button>
                        <button
                            className={`switch-btn ${viewType === 'yearly' ? 'active' : ''}`}
                            onClick={() => setViewType('yearly')}
                        >
                            รายปี
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className={`toggle-btn ${isMaximized ? 'active' : ''}`}
                        onClick={() => setIsMaximized(!isMaximized)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '700'
                        }}
                    >
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        <span>{isMaximized ? 'ย่อหน้าจอ' : 'ขยายดูยอดลงงานทั้งหมด'}</span>
                    </button>
                </div>
            </div>

            <div className="admin-main-grid">
                <div className="admin-table-col">
                    {viewMode === 'monthly' ? (
                        <MonthlyTable
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            trips={currentMonthTripsEnriched}
                            onMonthChange={handleMonthChange}
                            onExport={handleExport}
                            onSelectDate={handleSelectDate}
                            onEditTrip={handleEditTrip}
                            onDeleteTrip={deleteTrip}
                            cnDeductions={cnDeductions}
                            setCnDeductions={setCnDeductions}
                        />
                    ) : (
                        <TripTable
                            trips={tripsArray}
                            onDelete={deleteTrip}
                            onEdit={handleEditTrip}
                            onExport={handleExport}
                        />
                    )}
                </div>

                <div ref={formRef} className="admin-form-col">
                    <TripForm
                        onAdd={addTrip}
                        onUpdate={handleUpdateTrip}
                        uploadFile={uploadFile}
                        routePresets={routePresets}
                        fetchPresets={fetchPresets}
                        externalDate={formDate}
                        onDateChange={(val) => setFormDate({ value: val, ts: Date.now() })}
                        editingTrip={editingTrip}
                        onCancelEdit={() => setEditingTrip(null)}
                    />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-main-grid {
                    display: flex;
                    gap: 1.25rem;
                    align-items: stretch;
                    margin-top: 0.5rem;
                    flex: ${isMaximized ? 'none' : '1'};
                    height: ${isMaximized ? 'auto' : 'initial'};
                    min-height: 0;
                }
                .admin-form-col {
                    display: ${isMaximized ? 'none' : 'flex'};
                    flex: 0 0 380px;
                    min-height: 0;
                }
                .admin-form-col > form {
                    flex: 1;
                    height: 100%;
                    overflow-y: auto;
                    padding: 0.8rem!important;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    transform-style: preserve-3d;
                }
                .admin-form-col > form:hover {
                    transform: translateZ(5px) rotateY(1deg);
                    box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.7);
                }
                /* Custom Scrollbar */
                .admin-form-col > form::-webkit-scrollbar { width: 4px; }
                .admin-form-col > form::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

                .admin-table-col {
                    flex: 1;
                    min-width: 0;
                    background: var(--glass-bg);
                    border-radius: 2rem;
                    border: 1px solid var(--glass-border);
                    backdrop-filter: blur(20px);
                    padding: 1.25rem;
                    box-shadow: 
                        0 20px 50px -10px rgba(0,0,0,0.5),
                        inset 0 1px 1px rgba(255,255,255,0.05);
                    height: ${isMaximized ? 'auto' : '100%'};
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                    transform-style: preserve-3d;
                }
                .admin-table-col:hover {
                    transform: translateZ(8px) rotateY(-0.5deg);
                    box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.8);
                }
                .admin-table-col .table-container {
                    flex: 1;
                    overflow-y: ${isMaximized ? 'visible' : 'auto'};
                    height: ${isMaximized ? 'auto' : 'initial'};
                }
                .summary-horizontal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
                    gap: 0.75rem;
                }
                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 0.8rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .summary-item .label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.65rem;
                    color: var(--text-dim);
                    text-transform: uppercase;
                }
                .summary-item .val {
                    font-size: 1rem;
                    font-weight: 800;
                    color: white;
                }
                .summary-item.highlight-green {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: rgba(16, 185, 129, 0.4);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
                }
                .summary-item.highlight-blue {
                    background: rgba(59, 130, 246, 0.08);
                    border-color: rgba(59, 130, 246, 0.3);
                }
                .summary-item.highlight-red {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.4);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
                }
                .summary-item.total {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.08));
                    border-color: rgba(168, 85, 247, 0.3);
                    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
                }
                .text-safe { color: var(--safe)!important; }
                .text-danger { color: var(--danger)!important; }
                .text-warning { color: var(--warning)!important; }

                .view-mode-toggle { border: 1px solid var(--glass-border); }
                .toggle-btn { 
                    border: none; 
                    background: transparent; 
                    color: var(--text-dim); 
                    padding: 6px 15px; 
                    border-radius: 8px; 
                    font-size: 13px; 
                    font-weight: 600; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                }
                .toggle-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(129, 140, 248, 0.3); }
                
                .btn-icon-refresh {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    color: var(--text-main);
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon-refresh:hover { background: var(--primary); border-color: var(--primary); color: white; }
                
                @media (max-width: 1200px) {
                    .admin-main-grid { flex-direction: column; height: auto; display: flex; }
                    .admin-form-col { width: 100%; flex: none; order: 1; height: auto; }
                    .admin-form-col > form { height: auto !important; overflow: visible !important; }
                    .admin-table-col { width: 100%; flex: none; order: 2; margin-top: 1rem; height: auto !important; }
                }
            `}} />
        </FleetDashboard>
    );
};

export default Dashboard;