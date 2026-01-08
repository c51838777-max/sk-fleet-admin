import React, { useState, useEffect } from 'react';
import {
    PlusCircle, Save, X, Calendar, MapPin, User, Banknote,
    Fuel, Truck, Wrench, Wallet, Sparkles, AlertCircle
} from 'lucide-react';

const TripEditModal = ({ trip, onSave, onClose }) => {
    const [formData, setFormData] = useState({ ...trip });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBasketChange = (e) => {
        const count = parseInt(e.target.value) || 0;
        let rev = 0;
        let share = 0;
        if (count >= 101) { rev = 1000; share = 700; }
        else if (count >= 91) { rev = 600; share = 400; }
        else if (count >= 86) { rev = 300; share = 200; }

        setFormData(prev => ({
            ...prev,
            basketCount: e.target.value,
            basket: rev || prev.basket,
            basketShare: share || prev.basketShare
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(trip.id, formData);
        onClose();
    };

    // Backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay fade-in" onClick={handleBackdropClick}>
            <div className="modal-content slide-up" style={{ maxWidth: '600px', width: '95%' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="icon-box" style={{ background: 'rgba(129, 140, 248, 0.1)', color: 'var(--primary)' }}>
                            <Save size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>แก้ไขข้อมูลรายการ</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {trip.id}</p>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="input-grid-premium" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div className="input-field-premium" style={{ gridColumn: '1 / -1' }}>
                            <label><Calendar size={14} /> วันที่</label>
                            <input type="date" name="date" className="input-premium" value={formData.date} onChange={handleChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><User size={14} /> ชื่อคนขับ</label>
                            <input type="text" name="driverName" className="input-premium" value={formData.driverName} onChange={handleChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><MapPin size={14} /> สายงาน</label>
                            <input type="text" name="route" className="input-premium" value={formData.route} onChange={handleChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><Banknote size={14} /> ค่าเที่ยว (บาท)</label>
                            <input type="number" name="price" className="input-premium" value={formData.price} onChange={handleChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><Wallet size={14} /> ค่าจ้าง</label>
                            <input type="number" name="wage" className="input-premium" value={formData.wage} onChange={handleChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><Fuel size={14} /> ค่าน้ำมัน</label>
                            <input type="number" name="fuel" className="input-premium" value={formData.fuel} onChange={handleChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><Truck size={14} /> จำนวนตะกร้า</label>
                            <input type="number" name="basketCount" className="input-premium" value={formData.basketCount} onChange={handleBasketChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><Banknote size={14} /> รายได้ตะกร้า</label>
                            <input type="number" name="basket" className="input-premium" value={formData.basket} onChange={handleChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><Sparkles size={14} /> ส่วนแบ่งตะกร้า</label>
                            <input type="number" name="basketShare" className="input-premium" value={formData.basketShare} onChange={handleChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><AlertCircle size={14} /> ยอดเบิกสะสม</label>
                            <input type="number" name="staffShare" className="input-premium" value={formData.staffShare} onChange={handleChange} />
                        </div>

                        <div className="input-field-premium">
                            <label><Wrench size={14} /> ค่าซ่อมบำรุง</label>
                            <input type="number" name="maintenance" className="input-premium" value={formData.maintenance} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '2rem' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>ยกเลิก</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                            <Save size={18} /> บันทึกการแก้ไข
                        </button>
                    </div>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                }
                .modal-content {
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    border-radius: 1.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    animation: slideUp 0.3s ease-out;
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--glass-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-body {
                    padding: 1.5rem;
                    max-height: 70vh;
                    overflow-y: auto;
                }
                .modal-footer {
                    padding: 1.5rem;
                    border-top: 1px solid var(--glass-border);
                    display: flex;
                    gap: 1rem;
                }
                .icon-box {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}} />
        </div>
    );
};

export default TripEditModal;
