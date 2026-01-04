import React from 'react';
import { X, Printer, Truck, Wallet, TrendingDown, Info, Shield, Receipt } from 'lucide-react';

const SalarySlip = ({ driverName, trips, onClose, period, cnDeduction = 0 }) => {
    // Safety Parser
    const p = (val) => parseFloat(val) || 0;

    const totalWage = trips.reduce((sum, t) => sum + p(t.wage), 0);
    const totalBasketShare = trips.reduce((sum, t) => sum + p(t.basketShare), 0);
    const totalAdvance = trips.reduce((sum, t) => sum + p(t.staffShare), 0);
    const cn = p(cnDeduction);

    // Logic match: Only give housing if there are trips
    const housingAllowance = trips.length > 0 ? 1000 : 0;

    const totalIncome = totalWage + totalBasketShare + housingAllowance;
    const netPay = totalIncome - totalAdvance - cn;

    return (
        <div className="modal-overlay fade-in">
            <div className="slip-window">
                <div className="glass-card slip-card-premium fade-in-up">
                    {/* Header */}
                    <div className="slip-header-premium">
                        <div className="header-brand">
                            <div className="brand-logo-container">
                                <h1 className="brand-title">SK FLEET</h1>
                                <p className="brand-subtitle">SOLUTIONS</p>
                            </div>
                            <div className="official-badge">
                                <Shield size={10} /> OFFICIAL SLIP
                            </div>
                        </div>
                        <button className="btn-close-minimal no-print" onClick={onClose}><X size={22} /></button>
                    </div>

                    <div className="slip-body-premium">
                        {/* Summary Header */}
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">พนักงาน</span>
                                <span className="value">{driverName}</span>
                            </div>
                            <div className="info-item" style={{ textAlign: 'right' }}>
                                <span className="label">รอบสรุปยอด</span>
                                <span className="value">{period}</span>
                            </div>
                        </div>

                        {/* SECTION: INCOME */}
                        <div className="slip-section">
                            <div className="section-title text-safe">
                                <Wallet size={14} /> รายรับพนักงาน (+)
                            </div>
                            <div className="data-table">
                                <div className="data-row">
                                    <span>ค่าเที่ยว ({trips.length} งาน)</span>
                                    <span className="val">฿{totalWage.toLocaleString()}</span>
                                </div>
                                <div className="data-row">
                                    <span>ส่วนแบ่งตะกร้า</span>
                                    <span className="val">฿{totalBasketShare.toLocaleString()}</span>
                                </div>
                                <div className="data-row highlight">
                                    <span>ค่าที่พักพนักงาน</span>
                                    <span className="val text-safe">฿{housingAllowance.toLocaleString()}</span>
                                </div>
                                <div className="data-divider"></div>
                                <div className="data-total">
                                    <span>รวมรายได้ทั้งหมด</span>
                                    <span className="total-val text-safe">฿{totalIncome.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* SECTION: DEDUCTIONS */}
                        <div className="slip-section" style={{ marginTop: '1.5rem' }}>
                            <div className="section-title text-danger">
                                <TrendingDown size={14} /> รายรายการหัก (-)
                            </div>
                            <div className="data-table">
                                <div className="data-row">
                                    <span>ยอดเงินเบิกสะสม</span>
                                    <span className="val-danger">-฿{totalAdvance.toLocaleString()}</span>
                                </div>
                                {cn > 0 && (
                                    <div className="data-row">
                                        <span>หักค่าสินค้า (CN)</span>
                                        <span className="val-danger">-฿{cn.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="data-divider"></div>
                                <div className="data-total">
                                    <span>รวมรายการหัก</span>
                                    <span className="total-val text-danger">-฿{(totalAdvance + cn).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* FINAL PAYOUT */}
                        <div className="final-pay-container">
                            <div className="pay-card">
                                <span className="pay-label">ยอดจ่ายสุทธิคงเหลือ</span>
                                <div className="pay-amount-row">
                                    <span className="currency">฿</span>
                                    <span className="amount">{netPay.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footnote */}
                        <div className="slip-footnote no-print">
                            <Info size={14} /> <span>แจ้งยอดคนขับเพื่อตรวจสอบความถูกต้อง</span>
                        </div>

                        {/* Signature area for Print Only */}
                        <div className="print-only signature-area">
                            <div className="sig-block">
                                <div className="sig-line"></div>
                                <p>พนักงาน / ผู้รับเงิน</p>
                            </div>
                            <div className="sig-block">
                                <div className="sig-line"></div>
                                <p>บริษัท / ผู้อนุมัติจ่าย</p>
                            </div>
                        </div>
                    </div>

                    <div className="slip-footer no-print">
                        <button className="btn btn-primary slip-btn" onClick={onClose}>
                            ปิดหน้าจอ
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .slip-window { width: 100%; max-width: 480px; }
                .slip-card-premium { 
                    background: #0a0a0b; 
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 2rem;
                    overflow: hidden;
                    box-shadow: 0 50px 100px rgba(0,0,0,0.8);
                }
                .slip-header-premium { 
                    padding: 1.5rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .header-brand { display: flex; flex-direction: column; gap: 0.5rem; }
                .brand-title { font-size: 1.5rem; font-weight: 900; color: white; margin: 0; line-height: 1; letter-spacing: -0.5px; }
                .brand-subtitle { font-size: 0.7rem; font-weight: 700; color: var(--primary); margin: 0; letter-spacing: 3px; }
                .official-badge { 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 4px; 
                    background: rgba(16, 185, 129, 0.1); 
                    color: #10b981; 
                    padding: 4px 10px; 
                    border-radius: 20px; 
                    font-size: 0.6rem; 
                    font-weight: 800;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    width: fit-content;
                }
                
                .slip-body-premium { padding: 1.75rem 2rem; }
                .info-grid { display: flex; justify-content: space-between; margin-bottom: 2rem; }
                .info-item .label { display: block; font-size: 0.65rem; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
                .info-item .value { font-size: 1rem; font-weight: 700; color: white; }

                .section-title { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
                .data-table { background: rgba(255,255,255,0.02); border-radius: 1.25rem; padding: 1rem; border: 1px solid rgba(255,255,255,0.05); }
                .data-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #aaa; margin-bottom: 0.75rem; }
                .data-row.highlight { color: #10b981; font-weight: 600; }
                .data-row .val { color: white; font-weight: 600; }
                .data-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 0.75rem 0; }
                .data-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem; }

                .final-pay-container { margin-top: 2.5rem; }
                .pay-card { 
                    background: linear-gradient(135deg, white, #f3f4f6); 
                    padding: 1.5rem; 
                    border-radius: 1.5rem; 
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    border: 1px solid white;
                }
                .pay-label { font-size: 0.75rem; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1.5px; }
                .pay-amount-row { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-top: 4px; }
                .pay-amount-row .currency { font-size: 1.25rem; font-weight: 800; color: #000; }
                .pay-amount-row .amount { font-size: 3.5rem; font-weight: 950; color: #000; letter-spacing: -3px; }

                .slip-footnote { text-align: center; margin-top: 1.5rem; color: #444; font-size: 0.7rem; display: flex; align-items: center; gap: 6px; justify-content: center; }
                .slip-footer { padding: 0 2rem 2rem 2rem; }
                .slip-btn { width: 100%; border-radius: 1rem; padding: 1rem; font-weight: 800; font-size: 1rem; }

                .val-danger { color: #f87171; font-weight: 600; }
                .text-safe { color: #10b981; }
                .text-danger { color: #f87171; }

                .print-only { display: none; }
                
                @media print {
                    .modal-overlay { background: white !important; padding: 0; display: block; position: absolute; }
                    .slip-window { max-width: 100% !important; margin: 0; }
                    .slip-card-premium { background: white !important; border: 2px solid #000 !important; color: black !important; box-shadow: none !important; }
                    .no-print { display: none !important; }
                    .print-only { display: flex !important; }
                    .slip-header-premium { border-bottom: 2px solid black !important; background: #f8f9fa !important; }
                    .brand-title { color: black !important; }
                    .brand-subtitle { color: #333 !important; }
                    .info-item .value, .data-row span, .data-total span { color: black !important; }
                    .data-table { background: white !important; border: 1.5px solid #000 !important; }
                    .pay-card { border: 3px solid #000 !important; background: white !important; box-shadow: none !important; }
                    .signature-area { justify-content: space-between; margin-top: 5rem; padding: 0 1rem; }
                    .sig-block { text-align: center; width: 40%; }
                    .sig-line { border-bottom: 2px solid black; margin-bottom: 10px; }
                    .sig-block p { font-size: 0.8rem; font-weight: 700; color: black; }
                }
                `}} />
        </div>
    );
};

export default SalarySlip;
