import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Wallet, CreditCard, Smartphone, Landmark, Receipt, CheckCircle2,
  QrCode, Copy, Printer, ShieldCheck, ArrowRight, Download, Building2, UtensilsCrossed
} from 'lucide-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import Confetti from '../components/common/Confetti'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import { selectBills, payBill, payCategoryBills } from '../store/slices/billsSlice'
import { pushToast } from '../store/slices/uiSlice'

const TYPE_ICON = { 'Hostel Fee': Landmark, 'Mess Bill': UtensilsCrossed, Laundry: Wallet }
const METHODS = [
  { id: 'upi', label: 'UPI / Dynamic QR Code', desc: 'Google Pay, PhonePe, Paytm, BHIM', icon: Smartphone },
  { id: 'card', label: 'Debit / Credit Card', desc: 'Visa, MasterCard, RuPay', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', desc: 'All major Indian banks', icon: Landmark },
]

function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

export default function Payments() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const bills = useSelector(selectBills)

  const [activeCategory, setActiveCategory] = useState('all') // 'all' | 'Hostel' | 'Mess'
  const [payingBill, setPayingBill] = useState(null)
  const [bulkCategory, setBulkCategory] = useState(null) // 'Hostel' | 'Mess' | null
  const [method, setMethod] = useState('upi')
  const [celebrate, setCelebrate] = useState(false)
  const [receiptBill, setReceiptBill] = useState(null)
  const [copiedUpi, setCopiedUpi] = useState(false)

  const scoped = role === 'admin' ? bills : bills.filter((b) => b.roomNumber === room.roomNumber)

  // Separate calculations for Hostel vs Mess
  const hostelUnpaid = scoped.filter((b) => (b.category === 'Hostel' || b.type === 'Hostel Fee') && b.status === 'Unpaid')
  const messUnpaid = scoped.filter((b) => (b.category === 'Mess' || b.type === 'Mess Bill') && b.status === 'Unpaid')
  const hostelTotalDue = hostelUnpaid.reduce((sum, b) => sum + b.amount, 0)
  const messTotalDue = messUnpaid.reduce((sum, b) => sum + b.amount, 0)
  const totalPaid = scoped.filter((b) => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0)

  // Filtered unpaid list according to active category
  const filteredUnpaid = scoped.filter((b) => {
    if (b.status !== 'Unpaid') return false
    if (activeCategory === 'Hostel') return b.category === 'Hostel' || b.type === 'Hostel Fee'
    if (activeCategory === 'Mess') return b.category === 'Mess' || b.type === 'Mess Bill'
    return true
  })

  // Filtered paid history
  const paidList = scoped.filter((b) => {
    if (b.status !== 'Paid') return false
    if (activeCategory === 'Hostel') return b.category === 'Hostel' || b.type === 'Hostel Fee'
    if (activeCategory === 'Mess') return b.category === 'Mess' || b.type === 'Mess Bill'
    return true
  })

  const confirmSinglePayment = () => {
    const txnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
    dispatch(payBill({ id: payingBill.id, method, transactionId: txnId }))
    dispatch(pushToast(`Payment of ${formatINR(payingBill.amount)} completed successfully!`, 'ok'))

    // Prepare receipt data
    const paidRecord = {
      ...payingBill,
      status: 'Paid',
      paidOn: new Date().toISOString().slice(0, 10),
      paymentMethod: method,
      transactionId: txnId,
    }

    setPayingBill(null)
    setCelebrate(true)
    setReceiptBill(paidRecord)
  }

  const confirmBulkPayment = () => {
    const txnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
    const targetCategory = bulkCategory
    const targetAmount = targetCategory === 'Hostel' ? hostelTotalDue : messTotalDue

    dispatch(payCategoryBills({ category: targetCategory, roomNumber: role === 'admin' ? null : room.roomNumber, method }))
    dispatch(pushToast(`All ${targetCategory} fees (${formatINR(targetAmount)}) cleared!`, 'ok'))

    const paidRecord = {
      id: `BULK-${targetCategory.toUpperCase()}`,
      type: `${targetCategory} Consolidated Fees`,
      category: targetCategory,
      description: `All pending ${targetCategory} dues cleared in full`,
      amount: targetAmount,
      studentName: user.name,
      roomNumber: room.roomNumber,
      status: 'Paid',
      paidOn: new Date().toISOString().slice(0, 10),
      paymentMethod: method,
      transactionId: txnId,
    }

    setBulkCategory(null)
    setCelebrate(true)
    setReceiptBill(paidRecord)
  }

  const copyUpiId = () => {
    navigator.clipboard?.writeText('vidudhi.hostel@icici')
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
    dispatch(pushToast('UPI ID copied to clipboard', 'info'))
  }

  return (
    <div className="page">
      <Confetti active={celebrate} onDone={() => setCelebrate(false)} />

      <div className="page-header">
        <div>
          <span className="eyebrow">Financial Accounts</span>
          <h1>Hostel &amp; Mess Fees</h1>
        </div>
        {role !== 'admin' && (
          <div className="page-header-actions">
            {hostelTotalDue > 0 && (
              <button className="btn btn-primary" onClick={() => { setBulkCategory('Hostel'); setMethod('upi') }}>
                <Landmark size={15} /> Pay Hostel Dues ({formatINR(hostelTotalDue)})
              </button>
            )}
            {messTotalDue > 0 && (
              <button className="btn btn-primary" onClick={() => { setBulkCategory('Mess'); setMethod('upi') }}>
                <UtensilsCrossed size={15} /> Pay Mess Dues ({formatINR(messTotalDue)})
              </button>
            )}
          </div>
        )}
      </div>

      {/* METRIC OVERVIEW CARDS: HOSTEL DUE, MESS DUE, TOTAL PAID */}
      <div className="stat-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <Building2 size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Hostel Fees Due</span>
            <span className="stat-value" style={{ color: hostelTotalDue > 0 ? '#DC2626' : 'var(--ink)' }}>
              {formatINR(hostelTotalDue)}
            </span>
            <span className="stat-delta">{hostelUnpaid.length} pending items</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <UtensilsCrossed size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Mess Fees Due</span>
            <span className="stat-value" style={{ color: messTotalDue > 0 ? '#D97706' : 'var(--ink)' }}>
              {formatINR(messTotalDue)}
            </span>
            <span className="stat-delta">{messUnpaid.length} pending items</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-border)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Total Paid To Date</span>
            <span className="stat-value" style={{ color: 'var(--accent-border)' }}>
              {formatINR(totalPaid)}
            </span>
            <span className="stat-delta">Verified receipts</span>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER TABS: ALL / HOSTEL FEES / MESS FEES */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveCategory('all')}
        >
          All Fees ({filteredUnpaid.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'Hostel' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveCategory('Hostel')}
        >
          Hostel Fees ({hostelUnpaid.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'Mess' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveCategory('Mess')}
        >
          Mess Fees ({messUnpaid.length})
        </button>
      </div>

      {/* OUTSTANDING / PENDING DUES LIST */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>
              {activeCategory === 'all' ? 'Outstanding Dues' : `${activeCategory} Outstanding Dues`}
            </h3>
            <p>{filteredUnpaid.length} items requiring clearance</p>
          </div>
        </div>

        {filteredUnpaid.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={32} color="var(--accent-border)" />
            <h4>All Clear!</h4>
            <p>You have no pending {activeCategory === 'all' ? '' : activeCategory} payments right now.</p>
          </div>
        ) : (
          <div className="bill-list">
            {filteredUnpaid.map((b) => {
              const Icon = TYPE_ICON[b.type] || Landmark
              const isHostel = b.category === 'Hostel' || b.type === 'Hostel Fee'
              return (
                <div className="bill-row" key={b.id}>
                  <div
                    className="bill-row-icon"
                    style={{
                      background: isHostel ? 'var(--accent-soft)' : '#FEF3C7',
                      color: isHostel ? 'var(--accent-border)' : '#D97706',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="bill-row-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="bill-row-title">{b.type}</span>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: isHostel ? 'var(--accent-soft)' : '#FEF3C7',
                          color: isHostel ? 'var(--accent-border)' : '#B45309',
                        }}
                      >
                        {isHostel ? 'HOSTEL' : 'MESS'}
                      </span>
                    </div>
                    <span className="bill-row-desc">{b.description}</span>
                    <span className="bill-row-due mono">Due {b.dueDate} · ID: {b.id}</span>
                  </div>
                  <div className="bill-row-amount">{formatINR(b.amount)}</div>
                  {role !== 'admin' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { setPayingBill(b); setMethod('upi') }}
                    >
                      Pay Now <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* COMPLETED PAYMENT HISTORY WITH PRINTABLE RECEIPTS */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Payment Ledger &amp; Official Receipts</h3>
            <p>{paidList.length} verified transactions on record</p>
          </div>
        </div>

        {paidList.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>No payment transactions found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Voucher ID</th>
                  {role === 'admin' && <th>Student</th>}
                  <th>Category</th>
                  <th>Fee Description</th>
                  <th>Amount</th>
                  <th>Paid Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paidList.map((b) => (
                  <tr key={b.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{b.transactionId || b.id}</td>
                    {role === 'admin' && <td>{b.studentName}</td>}
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'var(--surface-2)' }}>
                        {b.category || (b.type.includes('Hostel') ? 'Hostel' : 'Mess')}
                      </span>
                    </td>
                    <td>{b.description}</td>
                    <td style={{ fontWeight: 700 }}>{formatINR(b.amount)}</td>
                    <td className="mono">{b.paidOn}</td>
                    <td><span className="mono" style={{ textTransform: 'uppercase', fontSize: 11.5 }}>{b.paymentMethod || 'UPI'}</span></td>
                    <td><Badge>Paid</Badge></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setReceiptBill(b)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Receipt size={13} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL (UPI WITH QR CODE, CARD, NETBANKING) */}
      {(payingBill || bulkCategory) && (
        <Modal
          title={`Pay ${formatINR(payingBill ? payingBill.amount : bulkCategory === 'Hostel' ? hostelTotalDue : messTotalDue)}`}
          subtitle={payingBill ? payingBill.description : `Clearing all ${bulkCategory} pending fees`}
          onClose={() => { setPayingBill(null); setBulkCategory(null) }}
          footer={<>
            <button className="btn btn-ghost" onClick={() => { setPayingBill(null); setBulkCategory(null) }}>Cancel</button>
            <button className="btn btn-primary" onClick={payingBill ? confirmSinglePayment : confirmBulkPayment}>
              Authorize &amp; Complete Payment
            </button>
          </>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Select Payment Gateway / Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {METHODS.map((m) => {
                  const Icon = m.icon
                  const isSelected = method === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`payment-method-row ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setMethod(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 12,
                        borderRadius: 10,
                        border: isSelected ? '2px solid var(--accent-border)' : '1px solid var(--line)',
                        background: isSelected ? 'var(--accent-soft)' : 'var(--surface)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <Icon size={20} color={isSelected ? 'var(--accent-border)' : 'var(--ink-soft)'} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{m.label}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{m.desc}</div>
                      </div>
                      {isSelected && <CheckCircle2 size={18} color="var(--accent-border)" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* UPI DYNAMIC QR CODE VIEW */}
            {method === 'upi' && (
              <div
                style={{
                  background: 'var(--bg-alt)',
                  border: '1px dashed var(--line-strong)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Scan UPI QR Code
                </div>

                {/* SVG QR Code Graphic */}
                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 10, boxShadow: 'var(--shadow-tag)', display: 'grid', placeItems: 'center' }}>
                  <svg width="130" height="130" viewBox="0 0 130 130">
                    <rect width="130" height="130" fill="#ffffff" />
                    {/* Corner Position Boxes */}
                    <rect x="10" y="10" width="35" height="35" rx="4" fill="#132216" />
                    <rect x="15" y="15" width="25" height="25" rx="2" fill="#ffffff" />
                    <rect x="20" y="20" width="15" height="15" rx="2" fill="#63C800" />

                    <rect x="85" y="10" width="35" height="35" rx="4" fill="#132216" />
                    <rect x="90" y="15" width="25" height="25" rx="2" fill="#ffffff" />
                    <rect x="95" y="20" width="15" height="15" rx="2" fill="#63C800" />

                    <rect x="10" y="85" width="35" height="35" rx="4" fill="#132216" />
                    <rect x="15" y="90" width="25" height="25" rx="2" fill="#ffffff" />
                    <rect x="20" y="95" width="15" height="15" rx="2" fill="#63C800" />

                    {/* Pattern Dots */}
                    <rect x="52" y="15" width="8" height="8" fill="#132216" />
                    <rect x="68" y="15" width="8" height="8" fill="#132216" />
                    <rect x="52" y="32" width="8" height="8" fill="#63C800" />
                    <rect x="68" y="32" width="8" height="8" fill="#132216" />

                    <rect x="15" y="52" width="8" height="8" fill="#132216" />
                    <rect x="32" y="52" width="8" height="8" fill="#63C800" />
                    <rect x="52" y="52" width="12" height="12" rx="2" fill="#132216" />
                    <rect x="72" y="52" width="8" height="8" fill="#132216" />
                    <rect x="88" y="52" width="8" height="8" fill="#63C800" />
                    <rect x="105" y="52" width="8" height="8" fill="#132216" />

                    <rect x="15" y="68" width="8" height="8" fill="#63C800" />
                    <rect x="32" y="68" width="8" height="8" fill="#132216" />
                    <rect x="52" y="72" width="8" height="8" fill="#132216" />
                    <rect x="68" y="72" width="8" height="8" fill="#63C800" />
                    <rect x="88" y="68" width="8" height="8" fill="#132216" />
                    <rect x="105" y="68" width="8" height="8" fill="#132216" />

                    <rect x="52" y="88" width="8" height="8" fill="#132216" />
                    <rect x="68" y="88" width="8" height="8" fill="#132216" />
                    <rect x="88" y="88" width="8" height="8" fill="#63C800" />
                    <rect x="52" y="105" width="8" height="8" fill="#63C800" />
                    <rect x="68" y="105" width="8" height="8" fill="#132216" />
                    <rect x="88" y="105" width="8" height="8" fill="#132216" />
                  </svg>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>
                    vidudhi.hostel@icici
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={copyUpiId} style={{ padding: '3px 7px' }}>
                    <Copy size={12} /> {copiedUpi ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                  Auto-reconciliation active. Transaction updates within 30 seconds.
                </span>
              </div>
            )}

            {/* CARD FORM */}
            {method === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label>Card Number</label>
                  <input type="text" placeholder="4111 •••• •••• 4242" defaultValue="4111 2345 6789 4242" />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" defaultValue="08/28" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>CVV</label>
                    <input type="password" placeholder="•••" defaultValue="123" />
                  </div>
                </div>
              </div>
            )}

            {/* NETBANKING FORM */}
            {method === 'netbanking' && (
              <div>
                <label>Select Bank</label>
                <select defaultValue="HDFC">
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="KOTAK">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* OFFICIAL PRINTABLE PAYMENT RECEIPT MODAL */}
      {receiptBill && (
        <Modal
          title="Official Fee &amp; Mess Receipt"
          subtitle={`Voucher Reference: ${receiptBill.transactionId || receiptBill.id}`}
          onClose={() => setReceiptBill(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setReceiptBill(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={15} /> Print / Save Receipt
            </button>
          </>}
        >
          <div
            style={{
              border: '2px solid var(--line-strong)',
              borderRadius: 12,
              padding: 20,
              background: '#FFFFFF',
              color: '#192219',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '2px solid var(--accent-border)', paddingBottom: 12, textAlign: 'center' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '0.02em', color: '#132216' }}>
                VIDUDHI RESIDENTIAL ACADEMY
              </h3>
              <p style={{ fontSize: 11.5, color: '#4C5D4E' }}>
                Hostel Administration &amp; Student Welfare Accounts Division
              </p>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  padding: '2px 8px',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent-border)',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                Official E-Receipt · Verified
              </span>
            </div>

            {/* Resident Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
              <div>
                <span style={{ color: '#819583', display: 'block', fontSize: 11 }}>Student Name</span>
                <strong>{receiptBill.studentName || user.name}</strong>
              </div>
              <div>
                <span style={{ color: '#819583', display: 'block', fontSize: 11 }}>Register / Roll No.</span>
                <strong className="mono">{user.regNo || '21CS0142'}</strong>
              </div>
              <div>
                <span style={{ color: '#819583', display: 'block', fontSize: 11 }}>Room &amp; Block</span>
                <strong>Room {receiptBill.roomNumber || room.roomNumber} ({room.block || 'A Block'})</strong>
              </div>
              <div>
                <span style={{ color: '#819583', display: 'block', fontSize: 11 }}>Date of Clearance</span>
                <strong className="mono">{receiptBill.paidOn || new Date().toISOString().slice(0, 10)}</strong>
              </div>
            </div>

            {/* Itemized Table */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F6F9F5', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                    <th style={{ padding: '8px 10px' }}>Fee Description</th>
                    <th style={{ padding: '8px 10px' }}>Category</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px' }}>{receiptBill.description}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-border)' }}>
                        {receiptBill.category || receiptBill.type}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>
                      {formatINR(receiptBill.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary & Stamp */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: '#819583' }}>Payment Channel</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase' }} className="mono">
                  {receiptBill.paymentMethod || 'UPI Transfer'} ({receiptBill.transactionId || 'VERIFIED'})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#819583' }}>Total Amount Paid</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#132216' }}>
                  {formatINR(receiptBill.amount)}
                </div>
              </div>
            </div>

            {/* Verified Stamp Badge */}
            <div
              style={{
                border: '1.5px dashed #059669',
                borderRadius: 8,
                padding: '8px 12px',
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#065F46',
                fontSize: 12,
              }}
            >
              <ShieldCheck size={18} color="#059669" />
              <div>
                <strong>Digitally Certified:</strong> Hostel Accounts Desk verified transaction against Treasury ledger.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
