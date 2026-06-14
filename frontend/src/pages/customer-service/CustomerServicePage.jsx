import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Headphones, MessageCircle, Plus, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import customerService from '../../services/customerService';

const statusLabel = {
  open: 'Open',
  pending: 'Menunggu Customer',
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

function MessageBubble({ item, currentUserId }) {
  const mine = item.sender?.id === currentUserId || item.sender_role === 'customer';

  return (
    <div style={{
      display: 'flex',
      justifyContent: mine ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
    }}>
      <div style={{
        maxWidth: '78%',
        backgroundColor: mine ? 'rgba(245,158,11,0.16)' : '#151821',
        border: mine ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '10px 12px',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '5px',
          justifyContent: mine ? 'flex-end' : 'flex-start',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: mine ? '#fbbf24' : '#94a3b8' }}>
            {mine ? 'Saya' : 'Admin Siber'}
          </span>
          <span style={{ fontSize: '10px', color: '#475569' }}>{formatDate(item.created_at)}</span>
        </div>
        <p style={{
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#e2e8f0',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}>
          {item.message}
        </p>
      </div>
    </div>
  );
}

export default function CustomerServicePage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [reply, setReply] = useState('');
  const [isWide, setIsWide] = useState(window.innerWidth >= 900);

  useEffect(() => {
    if (location.state?.subject) setSubject(location.state.subject);
    if (location.state?.message) setNewMessage(location.state.message);
  }, [location.state]);

  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const selectedFromList = useMemo(
    () => conversations.find((item) => item.id === selectedId),
    [conversations, selectedId]
  );

  const fetchConversations = async () => {
    try {
      const response = await customerService.getConversations();
      const items = response.data || [];
      setConversations(items);
      if (!selectedId && items.length > 0) setSelectedId(items[0].id);
    } catch (_) {
      toast.error('Gagal memuat customer service');
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
      const response = await customerService.getConversation(id);
      setSelectedConversation(response.data);
    } catch (_) {
      toast.error('Gagal memuat detail chat');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    fetchDetail(selectedId);
  }, [selectedId]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newMessage.trim()) {
      toast.error('Pesan awal wajib diisi');
      return;
    }

    setCreating(true);
    try {
      const response = await customerService.createConversation({
        subject: subject.trim() || 'Bantuan Siber Merch',
        message: newMessage.trim(),
        priority: 'normal',
      });
      toast.success('Chat berhasil dibuat');
      setSubject('');
      setNewMessage('');
      await fetchConversations();
      setSelectedId(response.data?.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat chat');
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!reply.trim() || !selectedId) return;

    setSending(true);
    try {
      await customerService.sendMessage(selectedId, reply.trim());
      setReply('');
      await Promise.all([fetchConversations(), fetchDetail(selectedId)]);
      toast.success('Pesan terkirim');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner text="Memuat customer service..." />;

  return (
    <section style={{ padding: '34px 0 56px' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '22px',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.25)',
              background: 'rgba(245,158,11,0.08)',
              borderRadius: '999px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '12px',
            }}>
              <Headphones size={14} />
              Customer Service
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              Bantuan Siber Merch
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '620px', lineHeight: 1.6 }}>
              Kirim pertanyaan umum ke admin. Nanti bagian produk, pesanan, dan transaksi bisa disambungkan setelah modul tim lain siap.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#121318',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '10px 12px',
          }}>
            <ShieldCheck size={18} style={{ color: '#34d399' }} />
            <div>
              <p style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }}>{user.name || 'Customer'}</p>
              <p style={{ fontSize: '11px', color: '#64748b' }}>Login aktif</p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isWide ? '340px 1fr' : '1fr',
          gap: '18px',
          alignItems: 'start',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <form onSubmit={handleCreate} style={{
              backgroundColor: '#121318',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Plus size={16} style={{ color: '#f59e0b' }} />
                <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>Buat Chat Baru</p>
              </div>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Judul pertanyaan"
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#0a0b0f',
                  color: '#e2e8f0',
                  padding: '0 12px',
                  fontSize: '13px',
                  marginBottom: '10px',
                }}
              />
              <textarea
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Tulis pesan awal..."
                rows={4}
                style={{
                  width: '100%',
                  resize: 'vertical',
                  minHeight: '96px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#0a0b0f',
                  color: '#e2e8f0',
                  padding: '12px',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  marginBottom: '12px',
                }}
              />
              <Button type="submit" loading={creating} style={{ width: '100%' }}>
                <MessageCircle size={15} />
                Mulai Chat
              </Button>
            </form>

            <div style={{
              backgroundColor: '#121318',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>Riwayat Chat</p>
                <Badge color="slate">{conversations.length}</Badge>
              </div>
              {conversations.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                  <Sparkles size={26} style={{ color: '#475569', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>Belum ada chat.</p>
                </div>
              ) : (
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {conversations.map((item) => {
                    const active = item.id === selectedId;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '13px 16px',
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: active ? 'rgba(245,158,11,0.1)' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '7px' }}>
                          <p style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.subject || 'Bantuan Siber Merch'}
                          </p>
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
          </div>

          <div style={{
            minHeight: '620px',
            backgroundColor: '#121318',
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
                  <p style={{ color: '#ffffff', fontWeight: 700, marginBottom: '6px' }}>Pilih atau buat chat</p>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Percakapan dengan admin akan tampil di sini.</p>
                </div>
              </div>
            ) : detailLoading ? (
              <LoadingSpinner text="Memuat pesan..." />
            ) : (
              <>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: 800 }}>
                      {selectedConversation?.subject || selectedFromList?.subject || 'Bantuan Siber Merch'}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '12px', marginTop: '3px' }}>
                      Admin: {selectedConversation?.assigned_admin?.name || 'Belum ditugaskan'}
                    </p>
                  </div>
                  <Badge color={statusColor[selectedConversation?.status || selectedFromList?.status] || 'slate'}>
                    {statusLabel[selectedConversation?.status || selectedFromList?.status] || 'Open'}
                  </Badge>
                </div>

                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#0c0d12' }}>
                  {(selectedConversation?.messages || []).length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '30px' }}>Belum ada pesan.</p>
                  ) : (
                    selectedConversation.messages.map((item) => (
                      <MessageBubble key={item.id} item={item} currentUserId={user.id} />
                    ))
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
                    placeholder="Tulis balasan..."
                    disabled={['resolved', 'closed'].includes(selectedConversation?.status)}
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
                  <Button type="submit" loading={sending} disabled={!reply.trim() || ['resolved', 'closed'].includes(selectedConversation?.status)}>
                    <Send size={15} />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
