import { useEffect, useMemo, useState } from 'react';
import { Headphones, MessageCircle, RefreshCw, Search, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import adminCustomerService from '../../../services/adminCustomerService';

const statuses = ['all', 'open', 'pending', 'resolved', 'closed'];

const statusLabel = {
  all: 'Semua',
  open: 'Open',
  pending: 'Pending',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

const statusColor = {
  open: 'green',
  pending: 'amber',
  resolved: 'blue',
  closed: 'slate',
};

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function MessageBubble({ item }) {
  const admin = item.sender_role === 'admin';

  return (
    <div style={{ display: 'flex', justifyContent: admin ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
      <div style={{
        maxWidth: '78%',
        padding: '10px 12px',
        borderRadius: '12px',
        background: admin ? 'rgba(245,158,11,0.16)' : '#151821',
        border: admin ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: admin ? 'flex-end' : 'flex-start', gap: '8px', marginBottom: '5px' }}>
          <span style={{ fontSize: '11px', color: admin ? '#fbbf24' : '#94a3b8', fontWeight: 700 }}>
            {admin ? 'Admin' : item.sender?.name || 'Customer'}
          </span>
          <span style={{ fontSize: '10px', color: '#475569' }}>{formatDate(item.created_at)}</span>
        </div>
        <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#e2e8f0', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {item.message}
        </p>
      </div>
    </div>
  );
}

export default function AdminCustomerServicePage() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isWide, setIsWide] = useState(window.innerWidth >= 1100);

  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 1100);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const selectedFromList = useMemo(
    () => conversations.find((item) => item.id === selectedId),
    [conversations, selectedId]
  );

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== 'all') params.status = status;
      if (search.trim()) params.search = search.trim();
      const response = await adminCustomerService.getConversations(params);
      const items = response.data || [];
      setConversations(items);
      if (!selectedId && items.length > 0) setSelectedId(items[0].id);
      if (selectedId && !items.some((item) => item.id === selectedId)) setSelectedId(items[0]?.id || null);
    } catch (_) {
      toast.error('Gagal memuat conversation CS');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    if (!id) {
      setSelectedConversation(null);
      return;
    }

    setDetailLoading(true);
    try {
      const response = await adminCustomerService.getConversation(id);
      setSelectedConversation(response.data);
    } catch (_) {
      toast.error('Gagal memuat detail chat');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [status]);

  useEffect(() => {
    fetchDetail(selectedId);
  }, [selectedId]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchConversations();
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!reply.trim() || !selectedId) return;

    setSending(true);
    try {
      await adminCustomerService.sendMessage(selectedId, reply.trim());
      setReply('');
      await Promise.all([fetchConversations(), fetchDetail(selectedId)]);
      toast.success('Balasan terkirim');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim balasan');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!selectedId) return;
    setUpdating(true);
    try {
      await adminCustomerService.updateStatus(selectedId, nextStatus);
      await Promise.all([fetchConversations(), fetchDetail(selectedId)]);
      toast.success('Status diperbarui');
    } catch (_) {
      toast.error('Gagal memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Headphones size={23} style={{ color: '#f59e0b' }} />
            Customer Service
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
            Kelola chat bantuan customer Siber Merch.
          </p>
        </div>
        <Button variant="ghost" onClick={fetchConversations} loading={loading}>
          <RefreshCw size={15} />
          Refresh
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isWide ? '380px 1fr' : '1fr',
        gap: '18px',
        alignItems: 'start',
      }}>
        <div style={{
          background: '#121318',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari customer atau pesan..."
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#0a0b0f',
                    color: '#e2e8f0',
                    padding: '0 12px 0 36px',
                    fontSize: '13px',
                  }}
                />
              </div>
              <Button type="submit" variant="outline">Cari</Button>
            </form>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
              {statuses.map((item) => (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  style={{
                    padding: '7px 11px',
                    borderRadius: '999px',
                    border: status === item ? '1px solid rgba(245,158,11,0.45)' : '1px solid rgba(255,255,255,0.08)',
                    background: status === item ? 'rgba(245,158,11,0.12)' : 'transparent',
                    color: status === item ? '#f59e0b' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {statusLabel[item]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Memuat conversation..." />
          ) : conversations.length === 0 ? (
            <div style={{ padding: '42px 20px', textAlign: 'center' }}>
              <MessageCircle size={30} style={{ color: '#475569', margin: '0 auto 10px' }} />
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>Belum ada conversation.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '650px', overflowY: 'auto' }}>
              {conversations.map((item) => {
                const active = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 16px',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: active ? 'rgba(245,158,11,0.1)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '7px' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '13px', color: '#ffffff', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.customer?.name || 'Customer'}
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.subject || 'Bantuan Siber Merch'}
                        </p>
                      </div>
                      <Badge color={statusColor[item.status] || 'slate'}>{statusLabel[item.status] || item.status}</Badge>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.last_message || 'Belum ada pesan'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>{formatDate(item.last_message_at || item.created_at)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{
          minHeight: '720px',
          background: '#121318',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {!selectedId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '28px' }}>
              <div>
                <MessageCircle size={34} style={{ color: '#475569', margin: '0 auto 12px' }} />
                <p style={{ color: '#ffffff', fontWeight: 800, marginBottom: '6px' }}>Pilih conversation</p>
                <p style={{ color: '#64748b', fontSize: '13px' }}>Detail percakapan customer akan tampil di sini.</p>
              </div>
            </div>
          ) : detailLoading ? (
            <LoadingSpinner text="Memuat detail chat..." />
          ) : (
            <>
              <div style={{
                padding: '16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
                <div>
                  <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: 800 }}>
                    {selectedConversation?.customer?.name || selectedFromList?.customer?.name || 'Customer'}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '12px', marginTop: '3px' }}>
                    {selectedConversation?.subject || selectedFromList?.subject || 'Bantuan Siber Merch'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge color={statusColor[selectedConversation?.status || selectedFromList?.status] || 'slate'}>
                    {statusLabel[selectedConversation?.status || selectedFromList?.status] || 'Open'}
                  </Badge>
                  <select
                    value={selectedConversation?.status || selectedFromList?.status || 'open'}
                    disabled={updating}
                    onChange={(event) => handleUpdateStatus(event.target.value)}
                    style={{
                      height: '34px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: '#0a0b0f',
                      color: '#e2e8f0',
                      padding: '0 10px',
                      fontSize: '12px',
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Selesai</option>
                    <option value="closed">Ditutup</option>
                  </select>
                </div>
              </div>

              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#0c0d12' }}>
                {(selectedConversation?.messages || []).length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '30px' }}>Belum ada pesan.</p>
                ) : (
                  selectedConversation.messages.map((item) => <MessageBubble key={item.id} item={item} />)
                )}
              </div>

              <form onSubmit={handleSend} style={{
                padding: '14px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end',
              }}>
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Tulis balasan admin..."
                  disabled={selectedConversation?.status === 'closed'}
                  rows={2}
                  style={{
                    flex: 1,
                    resize: 'none',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#0a0b0f',
                    color: '#e2e8f0',
                    padding: '10px 12px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                />
                <Button type="submit" loading={sending} disabled={!reply.trim() || selectedConversation?.status === 'closed'}>
                  <Send size={15} />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
