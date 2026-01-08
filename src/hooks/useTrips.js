import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getLocalDate } from '../utils/dateUtils';

// Helper: Normalize Trip Data (Moved outside to be stable)
const normalizeTrip = (t) => {
    if (!t) return null;
    const driverName = (t.driverName || t.driver_name || t.driver || t.staff || t.name || '').trim().replace(/\s+/g, ' ');
    const p = (v) => parseFloat(v) || 0;
    const price = p(t.price);
    const fuel = p(t.fuel);
    const wage = p(t.wage);
    const basket = p(t.basket);
    const maintenance = p(t.maintenance);

    // staffShare (Yod Berk) - logic to read from multiple possible names
    const staffShare = p(t.staffShare) || p(t.advance) || p(t.staff_advance) || 0;
    // basketShare reads from staff_share in DB or basketShare in frontend
    const basketShare = p(t.basketShare) || p(t.basket_share) || p(t.staff_share) || 0;

    const profit = (price + basket) - (fuel + wage + maintenance + basketShare);

    // Date normalization
    let dateStr = getLocalDate();
    if (t.date) {
        if (typeof t.date === 'string') {
            dateStr = t.date.split('T')[0];
        } else {
            const d = new Date(t.date);
            if (!isNaN(d.getTime())) {
                dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
        }
    }

    return {
        id: t.id,
        date: dateStr,
        driverName,
        route: t.route || t.path || '',
        price,
        fuel,
        wage,
        maintenance,
        basket,
        basketCount: parseInt(t.basket_count || t.basketCount || 0),
        basketShare, staffShare, profit,
        fuel_bill_url: t.fuel_bill_url || t.fuel_url || t.fuelUrl || null,
        maintenance_bill_url: t.maintenance_bill_url || t.maintenance_url || t.maintenanceUrl || null,
        basket_bill_url: t.basket_bill_url || t.basket_url || t.basketUrl || null
    };
};

// Helper: Enrich Trips (Moved outside)
const enrichTripsWithPresets = (tripsInput) => {
    return tripsInput.map(t => ({ ...t }));
};

export const useTrips = () => {
    const [trips, setTrips] = useState([]);
    const [routePresets, setRoutePresets] = useState({});
    const [cnDeductions, setCnDeductions] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isSupabaseReady, setIsSupabaseReady] = useState(false);

    // Initialize Supabase Status
    useEffect(() => {
        setIsSupabaseReady(!!supabase);
    }, []);

    const fetchTrips = useCallback(async () => {
        try {
            setLoading(true);

            // Try local cache first for immediate UI
            const localData = localStorage.getItem('trips');
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    if (Array.isArray(parsed)) {
                        setTrips(parsed.map(normalizeTrip).filter(Boolean));
                    }
                } catch (e) {
                    console.error("Local storage parse error:", e);
                }
            }

            if (isSupabaseReady) {
                console.log("Fetching trips from Supabase...");
                const { data, error } = await supabase
                    .from('trips')
                    .select('*')
                    .order('date', { ascending: false });

                if (error) throw error;

                if (data) {
                    const normalized = data.map(normalizeTrip).filter(Boolean);
                    setTrips(normalized);
                    localStorage.setItem('trips', JSON.stringify(normalized));
                }
            }
        } catch (err) {
            console.error('Fetch trips error:', err);
        } finally {
            setLoading(false);
        }
    }, [isSupabaseReady]);

    const fetchPresets = useCallback(async (month, year, shouldSetState = true) => {
        if (!isSupabaseReady) return;
        const suffixes = [
            `_${month + 1}_${year}`,
            `_${month + 1}_${String(year).slice(-2)}`,
            ''
        ];

        let finalPresets = {};

        for (const suffix of suffixes) {
            const { data } = await supabase.from('route_presets').select('*').ilike('route_name', `%${suffix}`);
            if (data && data.length > 0) {
                data.forEach(p => {
                    const cleanName = p.route_name.replace(suffix, '').trim();
                    if (!finalPresets[cleanName]) {
                        finalPresets[cleanName] = { price: p.price, wage: p.wage };
                    }
                });
            }
        }

        if (shouldSetState) {
            setRoutePresets(finalPresets);
        }
        return finalPresets;
    }, [isSupabaseReady]);

    const fetchCnDeductions = useCallback(async () => {
        if (!isSupabaseReady) return;
        try {
            const { data } = await supabase.from('cn_deductions').select('*');
            if (data) {
                const mapping = {};
                data.forEach(d => mapping[d.driver_name] = d.amount);
                setCnDeductions(prev => ({ ...prev, ...mapping }));
            }
        } catch (error) {
            console.error("Error fetching CN deductions:", error);
        }
    }, [isSupabaseReady]);

    const calculateStats = useCallback((tripsData, cnMap = {}) => {
        const baseStats = tripsData.reduce((acc, t) => {
            acc.totalTrips += 1;
            acc.totalPrice += (t.price || 0);
            acc.totalWage += (t.wage || 0);
            acc.totalBasket += (t.basket || 0);
            acc.totalBasketShare += (t.basketShare || 0);
            acc.totalFuel += (t.fuel || 0);
            acc.totalMaintenance += (t.maintenance || 0);
            acc.totalStaffAdvance += (t.staffShare || 0);
            acc.totalRevenue += (t.price || 0) + (t.basket || 0);
            acc.totalProfit += (t.profit || 0);
            return acc;
        }, {
            totalTrips: 0, totalPrice: 0, totalWage: 0, totalBasket: 0,
            totalBasketShare: 0, totalFuel: 0, totalMaintenance: 0,
            totalStaffAdvance: 0, totalRevenue: 0, totalProfit: 0
        });

        const driverGroups = {};
        tripsData.forEach(t => {
            if (!driverGroups[t.driverName]) driverGroups[t.driverName] = [];
            driverGroups[t.driverName].push(t);
        });

        let totalNetPay = 0;
        Object.entries(driverGroups).forEach(([name, driverTrips]) => {
            const wage = driverTrips.reduce((s, t) => s + (t.wage || 0), 0);
            const bShare = driverTrips.reduce((s, t) => s + (t.basketShare || 0), 0);
            const adv = driverTrips.reduce((s, t) => s + (t.staffShare || 0), 0);
            const cn = parseFloat(cnMap[name]) || 0;
            const housing = driverTrips.length > 0 ? 1000 : 0;
            totalNetPay += (wage + bShare + housing) - (adv + cn);
        });

        baseStats.totalNetPay = totalNetPay;
        return baseStats;
    }, []);

    // Subscriptions
    useEffect(() => {
        if (!isSupabaseReady) return;
        fetchTrips();

        const channel = supabase.channel('realtime-trips')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTrips(prev => [normalizeTrip(payload.new), ...prev].filter(Boolean));
                } else if (payload.eventType === 'DELETE') {
                    setTrips(prev => prev.filter(t => t.id !== payload.old.id));
                } else if (payload.eventType === 'UPDATE') {
                    setTrips(prev => prev.map(t => t.id === payload.new.id ? normalizeTrip(payload.new) : t).filter(Boolean));
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [isSupabaseReady, fetchTrips]);

    // Fetch Presets and CN Deductions when Month/Year changes
    useEffect(() => {
        if (isSupabaseReady) {
            fetchPresets(currentMonth, currentYear);
            fetchCnDeductions();
        }
    }, [currentMonth, currentYear, isSupabaseReady, fetchPresets, fetchCnDeductions]);


    const saveRoutePreset = async (route, price, wage, targetMonth, targetYear) => {
        if (!isSupabaseReady) return { success: false, error: 'Supabase not ready' };

        const m = targetMonth !== undefined ? targetMonth : currentMonth;
        const y = targetYear !== undefined ? targetYear : currentYear;
        const suffix = `_${m + 1}_${y}`;
        const routeNameWithSuffix = `${route.trim()}${suffix}`;

        const { error } = await supabase.from('route_presets').upsert({
            route_name: routeNameWithSuffix,
            price: parseFloat(price),
            wage: parseFloat(wage)
        }, { onConflict: 'route_name' });

        if (error) {
            console.error("Error saving preset:", error);
            return { success: false, error };
        }

        await fetchPresets(m, y);
        return { success: true };
    };

    const deletePreset = async (route, targetMonth, targetYear) => {
        if (!isSupabaseReady) return { success: false };
        const m = targetMonth !== undefined ? targetMonth : currentMonth;
        const y = targetYear !== undefined ? targetYear : currentYear;
        const suffix = `_${m + 1}_${y}`;
        const targetName = `${route.trim()}${suffix}`;

        const { error } = await supabase.from('route_presets').delete().eq('route_name', targetName);
        if (error) return { success: false, error };

        await fetchPresets(m, y);
        return { success: true };
    };





    // Logic to select correct trips for Month View Enriched
    const currentMonthTripsEnriched = useMemo(() => {
        const startDate = new Date(currentYear, currentMonth - 1, 20);
        const endDate = new Date(currentYear, currentMonth, 19);
        const filtered = trips.filter(t => {
            if (!t.date) return false;
            const [y, m, d] = t.date.split('-').map(Number);
            const checkDate = new Date(y, m - 1, d);
            return checkDate >= startDate && checkDate <= endDate;
        });
        return enrichTripsWithPresets(filtered);
    }, [trips, currentMonth, currentYear]);

    const stats = useMemo(() => calculateStats(currentMonthTripsEnriched, cnDeductions), [currentMonthTripsEnriched, cnDeductions, calculateStats]);
    const yearlyStats = useMemo(() => {
        const filtered = trips.filter(t => t.date && parseInt(t.date.split('-')[0]) === currentYear);
        return calculateStats(filtered, {});
    }, [trips, currentYear, calculateStats]);

    const addTrip = async (trip) => {
        const p = (v) => parseFloat(v) || 0;
        const driverName = (trip.driverName || '').trim().replace(/\s+/g, ' ');
        const baseData = {
            date: trip.date || getLocalDate(), route: trip.route || '',
            price: p(trip.price), fuel: p(trip.fuel), wage: p(trip.wage), basket: p(trip.basket),
            maintenance: p(trip.maintenance), fuel_bill_url: trip.fuel_bill_url || null,
            maintenance_bill_url: trip.maintenance_bill_url || null, basket_bill_url: trip.basket_bill_url || null
        };
        const staffShare = p(trip.staffShare); const basketShare = p(trip.basketShare); const basketCount = parseInt(trip.basketCount) || 0;

        if (isSupabaseReady) {
            // Updated mapping to match standard columns
            const payload = {
                ...baseData,
                driver_name: driverName,
                advance: staffShare,
                staff_share: basketShare,
                basket_count: basketCount
            };

            const { data, error } = await supabase.from('trips').insert([payload]).select();
            if (error) {
                console.error("Insert error:", error);
                return { success: false, error };
            }

            if (data?.[0]) {
                const newTrip = normalizeTrip(data[0]);
                setTrips(prev => {
                    const next = [newTrip, ...prev];
                    localStorage.setItem('trips', JSON.stringify(next));
                    return next;
                });
                return { success: true };
            }
            return { success: false, error: 'No data returned' };
        } else {
            const newTrip = normalizeTrip({ ...baseData, driverName, staffShare, basketShare, basketCount, id: Date.now() });
            setTrips(prev => {
                const next = [newTrip, ...prev];
                localStorage.setItem('trips', JSON.stringify(next));
                return next;
            });
            return { success: true };
        }
    };

    const deleteTrip = async (id) => {
        if (isSupabaseReady) await supabase.from('trips').delete().eq('id', id);
        setTrips(prev => prev.filter(t => t.id !== id));
    };

    const updateTrip = async (id, updatedData) => {
        const p = (v) => parseFloat(v) || 0;
        const driverName = (updatedData.driverName || '').trim().replace(/\s+/g, ' ');
        const baseData = {
            date: updatedData.date, route: updatedData.route,
            price: p(updatedData.price), fuel: p(updatedData.fuel), wage: p(updatedData.wage), basket: p(updatedData.basket),
            maintenance: p(updatedData.maintenance), fuel_bill_url: updatedData.fuel_bill_url,
            maintenance_bill_url: updatedData.maintenance_bill_url, basket_bill_url: updatedData.basket_bill_url
        };
        const staffShare = p(updatedData.staffShare); const basketShare = p(updatedData.basketShare); const basketCount = parseInt(updatedData.basketCount) || 0;

        if (isSupabaseReady) {
            const payload = { ...baseData, driver_name: driverName, advance: staffShare, staff_share: basketShare, basket_count: basketCount };
            const { error } = await supabase.from('trips').update(payload).eq('id', id);
            if (error) return { success: false, error };
            setTrips(prev => prev.map(t => t.id === id ? normalizeTrip({ ...payload, id }) : t));
            return { success: true };
        } else {
            setTrips(prev => prev.map(t => t.id === id ? normalizeTrip({ ...baseData, driverName, staffShare, basketShare, basketCount, id }) : t));
            return { success: true };
        }
    };

    const uploadFile = async (file, bucket) => {
        if (!isSupabaseReady || !file) return null;
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
            const filePath = `${fileName}`;

            console.log(`Uploading to bills/${bucket}/${filePath}...`);
            const { error: uploadError } = await supabase.storage.from('bills').upload(`${bucket}/${filePath}`, file);

            if (uploadError) {
                console.error(`Upload failed to bucket "bills":`, uploadError.message, uploadError);
                return null;
            }

            const { data: { publicUrl } } = supabase.storage.from('bills').getPublicUrl(`${bucket}/${filePath}`);
            console.log(`Upload success! Public URL: ${publicUrl}`);
            return publicUrl;
        } catch (err) {
            console.error(`Unexpected error during upload to ${bucket}:`, err);
            return null;
        }
    };

    return {
        trips, addTrip, deleteTrip, updateTrip, stats, yearlyStats,
        currentMonth, setCurrentMonth, currentYear, setCurrentYear,
        routePresets, cnDeductions, setCnDeductions,
        saveRoutePreset, deletePreset, fetchPresets,
        isSupabaseReady, fetchTrips, loading, uploadFile,
        currentMonthTripsEnriched
    };
};
