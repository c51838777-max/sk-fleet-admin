import React from 'react';
import { Download, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, ReceiptText, Camera, History, X } from 'lucide-react';
import SalarySlip from './SalarySlip';

const MonthlyTable = ({ currentMonth, currentYear, trips, onMonthChange, onExport, onSelectDate, onEditTrip, onDeleteTrip, cnDeductions, setCnDeductions }) => {
    const [selectedDriverForSlip, setSelectedDriverForSlip] = React.useState(null);
    const [selectedDriverForHistory, setSelectedDriverForHistory] = React.useState(null);

    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const getDatesInRange = () => {
        const dates = [];
        const startDate = new Date(currentYear, currentMonth - 1, 20);
        const endDate = new Date(currentYear, currentMonth, 19);

        let current = new Date(startDate);
        while (current <= endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    const datesInRange = getDatesInRange();

    const getDayData = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const dayTrips = trips.filter(t => t.date === dateStr);

        if (dayTrips.length === 0) return { route: '-', price: 0, fuel: 0, wage: 0, basket: 0, basketShare: 0, staffShare: 0, maintenance: 0, advance: 0, profit: 0, count: 0, items: [] };

        return {
            ...dayTrips.reduce((acc, trip) => ({
                route: dayTrips.map(t => t.route).join(', '),
                driverName: dayTrips.map(t => t.driverName).filter(n => n).join(', ') || '-',
                price: acc.price + trip.price,
                fuel: acc.fuel + trip.fuel,
                wage: acc.wage + trip.wage,
                basket: acc.basket + trip.basket,
                staffShare: acc.staffShare + trip.staffShare,
                maintenance: acc.maintenance + trip.maintenance,
                basketShare: acc.basketShare + trip.basketShare,
                profit: acc.profit + trip.profit
            }), { price: 0, fuel: 0, wage: 0, basket: 0, staffShare: 0, maintenance: 0, basketShare: 0, profit: 0 }),
            count: dayTrips.length,
            items: dayTrips
        };
    };

    return (
        <div className="glass-card fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="header" style={{ padding: '1rem 1.5rem', marginBottom: '0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem' }}>ตารางรอบสรุปยอด (20 - 19)</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            ยอดของรอบที่เลือก: {months[currentMonth]} {currentYear}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0.25rem' }}>
                        <button className="btn-icon" onClick={() => onMonthChange(-1)}><ChevronLeft size={18} /></button>
                        <span style={{ minWidth: '120px', textAlign: 'center', fontWeight: '500' }}>
                            {months[currentMonth]} {currentYear}
                        </span>
                        <button className="btn-icon" onClick={() => onMonthChange(1)}><ChevronRight size={18} /></button>
                    </div>
                </div>
                <button className="btn btn-outline" onClick={onExport}>
                    <Download size={18} />
                    Export รอบนี้
                </button>
            </div>

            <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
                <table>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--card-bg)', backdropFilter: 'blur(10px)' }}>
                        <tr>
                            <th style={{ width: '120px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>วันที่</th>
                            <th style={{ width: '100px', padding: '0.3rem 0.2rem', textAlign: 'left' }}>คนขับ</th>
                            <th style={{ minWidth: '120px', padding: '0.3rem 0.2rem', textAlign: 'left' }}>สายงาน</th>
                            <th style={{ width: '75px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>ค่าเที่ยว</th>
                            <th style={{ width: '75px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>น้ำมัน</th>
                            <th style={{ width: '75px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>ค่าจ้าง</th>
                            <th style={{ width: '75px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>ค่าซ่อม</th>
                            <th style={{ width: '75px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>ตะกร้า</th>
                            <th style={{ width: '65px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>แบ่ง</th>
                            <th style={{ width: '75px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>เบิก</th>
                            <th style={{ width: '75px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>กำไร</th>
                            <th style={{ width: '80px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.8rem' }}>
                        {datesInRange.flatMap((date) => {
                            const data = getDayData(date);
                            const isToday = new Date().toDateString() === date.toDateString();
                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

                            if (data.items.length === 0) {
                                return [(
                                    <tr key={`empty-${dateStr}`} style={isToday ? { background: 'rgba(99, 102, 241, 0.1)' } : {}}>
                                        <td style={{ width: '150px', padding: '0.4rem 0.2rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                                <button className="btn-icon" style={{ background: 'var(--primary)', color: 'white', padding: '1px', borderRadius: '3px' }} onClick={() => onSelectDate(dateStr)}>
                                                    <Plus size={10} />
                                                </button>
                                                <span style={{ fontWeight: '600', color: isToday ? 'var(--primary)' : 'var(--text-dim)', fontSize: '0.75rem' }}>
                                                    {date.getDate()} {months[date.getMonth()].replace('คม', '').replace('ยน', '')}
                                                </span>
                                            </div>
                                        </td>
                                        <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-dim)', opacity: 0.3, fontSize: '0.7rem' }}>ไม่มีรายการ</td>
                                        <td></td>
                                    </tr>
                                )];
                            }

                            return data.items.map((trip, tIdx) => (
                                <tr key={trip.id} style={isToday ? { background: 'rgba(99, 102, 241, 0.1)' } : {}}>
                                    <td style={{ width: '150px', padding: '0.4rem 0.2rem', textAlign: 'center', borderRight: tIdx === 0 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                                        {tIdx === 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                                <button className="btn-icon" style={{ background: 'var(--primary)', color: 'white', padding: '1px', borderRadius: '3px' }} onClick={() => onSelectDate(dateStr)}>
                                                    <Plus size={10} />
                                                </button>
                                                <span style={{ fontWeight: '600', color: isToday ? 'var(--primary)' : 'var(--text-dim)', fontSize: '0.75rem' }}>
                                                    {date.getDate()} {months[date.getMonth()].replace('คม', '').replace('ยน', '')}
                                                </span>
                                            </div>
                                        ) : null}
                                    </td>
                                    <td style={{ width: '90px', padding: '0.4rem 0.2rem', color: 'var(--primary)', fontWeight: '500', textAlign: 'left' }}>
                                        {trip.driverName}
                                    </td>
                                    <td style={{ minWidth: '80px', padding: '0.4rem 0.2rem', color: 'var(--text-main)', textAlign: 'left' }}>
                                        {trip.route}
                                    </td>
                                    <td style={{ width: '75px', padding: '0.4rem 0.2rem', textAlign: 'center' }}>{trip.price > 0 ? trip.price.toLocaleString() : '-'}</td>
                                    <td style={{ width: '75px', padding: '0.4rem 0.2rem', textAlign: 'center', color: 'var(--danger)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            <span>{trip.fuel > 0 ? trip.fuel.toLocaleString() : '-'}</span>
                                            {(trip.fuel_bill_url || trip.fuel_url) && (
                                                <a href={trip.fuel_bill_url || trip.fuel_url} target="_blank" rel="noreferrer" title="กดดูรูปน้ำมัน" className="bill-icon-btn">
                                                    <Camera size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ width: '75px', padding: '0.4rem 0.2rem', textAlign: 'center', color: 'var(--danger)' }}>{trip.wage > 0 ? trip.wage.toLocaleString() : '-'}</td>
                                    <td style={{ width: '75px', padding: '0.4rem 0.2rem', textAlign: 'center', color: 'var(--danger)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            <span>{trip.maintenance > 0 ? trip.maintenance.toLocaleString() : '-'}</span>
                                            {(trip.maintenance_bill_url || trip.maintenance_url) && (
                                                <a href={trip.maintenance_bill_url || trip.maintenance_url} target="_blank" rel="noreferrer" title="กดดูรูปค่าซ่อม" className="bill-icon-btn">
                                                    <Camera size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ width: '75px', padding: '0.4rem 0.2rem', textAlign: 'center', color: 'var(--success)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            <span>{trip.basket > 0 ? trip.basket.toLocaleString() : '-'}</span>
                                            {(trip.basket_bill_url || trip.basket_url) && (
                                                <a href={trip.basket_bill_url || trip.basket_url} target="_blank" rel="noreferrer" title="กดดูรูปตะกร้า" className="bill-icon-btn">
                                                    <Camera size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ width: '65px', padding: '0.4rem 0.2rem', textAlign: 'center', color: 'var(--danger)' }}>
                                        {trip.basketShare > 0 ? trip.basketShare.toLocaleString() : '-'}
                                    </td>
                                    <td style={{ width: '75px', padding: '0.4rem 0.2rem', textAlign: 'center', color: 'var(--warning)' }}>
                                        {trip.staffShare > 0 ? trip.staffShare.toLocaleString() : '-'}
                                    </td>
                                    <td style={{ width: '75px', padding: '0.4rem 0.2rem', textAlign: 'center' }}>
                                        {trip.profit !== 0 ? (
                                            <span className={`badge ${trip.profit >= 0 ? 'badge-profit' : 'badge-loss'}`} style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>
                                                {Math.round(trip.profit).toLocaleString()}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td style={{ width: '80px', padding: '0.4rem 0.2rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button className="btn-icon" onClick={() => onEditTrip(trip)} style={{ padding: '4px' }} title="แก้ไข">
                                                <Edit2 size={16} color="var(--primary)" />
                                            </button>
                                            <button className="btn-icon" onClick={() => onDeleteTrip(trip.id)} style={{ padding: '4px' }} title="ลบ">
                                                <Trash2 size={16} color="var(--danger)" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ));
                        })}
                    </tbody>
                    <tfoot style={{ position: 'sticky', bottom: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderTop: '2px solid var(--primary-glow)', zIndex: 20 }}>
                        {(() => {
                            const totals = datesInRange.reduce((acc, date) => {
                                const data = getDayData(date);
                                return {
                                    price: acc.price + (data.price || 0),
                                    fuel: acc.fuel + (data.fuel || 0),
                                    wage: acc.wage + (data.wage || 0),
                                    maintenance: acc.maintenance + (data.maintenance || 0),
                                    basket: acc.basket + (data.basket || 0),
                                    basketShare: acc.basketShare + (data.basketShare || 0),
                                    staffShare: acc.staffShare + (data.staffShare || 0),
                                    profit: acc.profit + (data.profit || 0)
                                };
                            }, { price: 0, fuel: 0, wage: 0, maintenance: 0, basket: 0, basketShare: 0, staffShare: 0, profit: 0 });

                            const totalCellStyles = { padding: '0.75rem 0.2rem', textAlign: 'center', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" };

                            return (
                                <tr style={{ fontWeight: '800' }}>
                                    <td style={{ ...totalCellStyles, color: 'var(--primary)', textAlign: 'center', fontFamily: "'Chakra Petch', sans-serif", fontSize: '0.9rem' }}>รวมสรุป</td>
                                    <td></td>
                                    <td></td>
                                    <td style={{ ...totalCellStyles, color: 'white' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '-2px' }}>ยอดรวม</div>
                                        ฿{totals.price.toLocaleString()}
                                    </td>
                                    <td style={{ ...totalCellStyles, color: 'var(--danger)' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '-2px' }}>- น้ำมัน</div>
                                        ฿{totals.fuel.toLocaleString()}
                                    </td>
                                    <td style={{ ...totalCellStyles, color: 'var(--danger)' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '-2px' }}>- ค่าจ้าง</div>
                                        ฿{totals.wage.toLocaleString()}
                                    </td>
                                    <td style={{ ...totalCellStyles, color: 'var(--danger)' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '-2px' }}>- ค่าซ่อม</div>
                                        ฿{totals.maintenance.toLocaleString()}
                                    </td>
                                    <td style={{ ...totalCellStyles, color: 'var(--safe)' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '-2px' }}>+ ตะกร้า</div>
                                        ฿{totals.basket.toLocaleString()}
                                    </td>
                                    <td style={{ ...totalCellStyles, color: 'var(--danger)' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '-2px' }}>- แบ่ง</div>
                                        ฿{totals.basketShare.toLocaleString()}
                                    </td>
                                    <td style={{ ...totalCellStyles, color: 'var(--warning)' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '-2px' }}>- เบิก</div>
                                        ฿{totals.staffShare.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.5rem 0' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginBottom: '2px', textAlign: 'center' }}>กำไรสุทธิ</div>
                                        <div className={`badge ${totals.profit >= 0 ? 'badge-profit' : 'badge-loss'}`} style={{ fontSize: '0.85rem', width: '90%', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                                            ฿{Math.round(totals.profit).toLocaleString()}
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                            );
                        })()}
                    </tfoot>
                </table>
            </div>

            {/* Salary Slips section */}
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ReceiptText size={18} color="var(--primary)" /> ออกสลิปเงินเดือนพนักงาน
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.25rem' }}>
                    {(() => {
                        const tripsInPeriod = datesInRange.flatMap(date => {
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, '0');
                            const d = String(date.getDate()).padStart(2, '0');
                            const dateStr = `${y}-${m}-${d}`;
                            return trips.filter(t => t.date === dateStr);
                        });

                        const driversMap = {};
                        tripsInPeriod.forEach(t => {
                            const name = t.driverName || 'ไม่ระบุชื่อ';
                            if (!driversMap[name]) driversMap[name] = [];
                            driversMap[name].push(t);
                        });

                        return Object.entries(driversMap).map(([name, driverTrips]) => {
                            const cn = parseFloat(cnDeductions[name]) || 0;
                            const totalPay = driverTrips.reduce((sum, t) => {
                                const wage = parseFloat(t.wage) || 0;
                                const bShare = parseFloat(t.basketShare || t.basket_share || t.staff_share) || 0;
                                const advance = parseFloat(t.staffShare || t.advance || t.staff_advance) || 0;
                                return sum + wage + bShare - advance;
                            }, 1000) - cn;

                            return (
                                <div key={name} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>ยอดสุทธิ: ฿{totalPay.toLocaleString()}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <div style={{ marginRight: '0.25rem' }}>
                                            <input
                                                type="number"
                                                placeholder="หัก CN"
                                                className="warning-input"
                                                style={{ width: '70px', padding: '0.25rem', fontSize: '0.75rem' }}
                                                value={cnDeductions[name] || ''}
                                                onChange={(e) => setCnDeductions({ ...cnDeductions, [name]: e.target.value })}
                                            />
                                        </div>

                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                            onClick={() => {
                                                const url = `${window.location.origin}${window.location.pathname}#/driver?view=${encodeURIComponent(name)}`;
                                                navigator.clipboard.writeText(url);
                                                alert(`ก๊อปปี้ลิงก์สลิปของ ${name} เรียบร้อย!`);
                                            }}
                                        >
                                            <Download size={14} /> ลิงก์
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                            onClick={() => setSelectedDriverForSlip({ name, trips: driverTrips, cn: cnDeductions[name] })}
                                        >
                                            <ReceiptText size={14} /> ดูสลิป
                                        </button>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>

            {selectedDriverForSlip && (
                <SalarySlip
                    driverName={selectedDriverForSlip.name}
                    trips={selectedDriverForSlip.trips}
                    cnDeduction={selectedDriverForSlip.cn}
                    onClose={() => setSelectedDriverForSlip(null)}
                    period={`20 ${months[(currentMonth - 1 + 12) % 12]} - 19 ${months[currentMonth]} ${currentYear}`}
                />
            )}

            {selectedDriverForHistory && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="header" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem' }}>ประวัติงาน: {selectedDriverForHistory.name}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>รวมทั้งสิ้น {selectedDriverForHistory.trips.length} เที่ยว</p>
                            </div>
                            <button className="btn-icon" onClick={() => setSelectedDriverForHistory(null)}><X size={24} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {selectedDriverForHistory.trips.map((trip, idx) => (
                                    <div key={trip.id || idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: '700', color: 'var(--primary)' }}>{trip.date}</p>
                                            <p style={{ fontSize: '0.9rem' }}>{trip.route}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: '800' }}>฿{(parseFloat(trip.wage) || 0).toLocaleString()}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ค่าเที่ยว: ฿{(parseFloat(trip.price) || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyTable;
