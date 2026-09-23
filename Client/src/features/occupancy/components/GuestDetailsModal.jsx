
import {
 Dialog,
 DialogContent,
 DialogActions,
 Box,
 Typography,
 IconButton,
 Button
} from'@mui/material';
import {
 Close as CloseIcon,
 Bed as BedIcon,
 Person as PersonIcon,
 LocationOn as LocationOnIcon,
 Phone as PhoneIcon,
 Email as EmailIcon,
 CreditCard as CreditCardIcon,
 Flag as FlagIcon,
 FlightLand as CheckInIcon, 
 FlightTakeoff as CheckOutIcon,
 ConfirmationNumber as TagIcon,
 Computer as GlobeIcon,
 Payment as PaymentIcon,
 AttachMoney as AttachMoneyIcon,
 Hotel as HotelIcon,
 Group as GroupIcon,
 Layers as FloorIcon,
 CleaningServices as CleanIcon,
 Star as StarIcon,
 Notes as NotesIcon,
 WorkspacePremium as VipIcon,
 MonetizationOn as PointsIcon,
 Edit as EditIcon,
  ExitToApp as ExitToAppIcon,
 CheckCircle as CheckCircleIcon,
 AccessTime as ClockIcon
} from'@mui/icons-material';

const InfoBlock = ({ icon, label, value, valueNode }) => (
 <Box sx={{ display:'flex', gap: 1.5, p: 1.5, backgroundColor:'#f8fafc', borderRadius: 2, mb: 1.25 }}>
 <Box sx={{ pt: 0.25, color:'#64748b', display:'flex', alignItems:'flex-start' }}>
 {icon}
 </Box>
 <Box sx={{ flex: 1 }}>
 <Typography sx={{ fontSize:'10px', fontWeight: 700, color:'#64748b', textTransform:'uppercase', mb: 0.5, letterSpacing:'0.02em' }}>{label}</Typography>
 {valueNode ? valueNode : <Typography sx={{ fontSize:'13px', color:'#1e293b', fontWeight: 500 }}>{value ||'N/A'}</Typography>}
 </Box>
 </Box>
);

const SectionCard = ({ title, icon, children }) => (
 <Box sx={{ backgroundColor:'white', borderRadius: 3, border:'1px solid #e2e8f0', p: 2, display:'flex', flexDirection:'column', height:'100%' }}>
 <Box sx={{ display:'flex', alignItems:'center', gap: 1, mb: 2.5, color:'#334155' }}>
 {icon}
 <Typography sx={{ fontWeight: 700, fontSize:'13px' }}>{title}</Typography>
 </Box>
 <Box sx={{ flex: 1 }}>
 {children}
 </Box>
 </Box>
);

export default function GuestDetailsModal({  open, onClose, onEdit, room , onCheckout }) {
 if (!room || !room.guest) return null;

 return (
 <Dialog
 open={open}
 onClose={onClose}
 maxWidth="lg"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 overflow:'hidden',
 backgroundColor:'#f1f5f9',
 boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.25)',
 },
 }}
 >
 {/* HEADER */}
 <Box sx={{ backgroundColor:'#2e7d32', px: 3, py: 1, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
 <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
 <Box sx={{ backgroundColor:'rgba(255,255,255,0.15)', p: 1, borderRadius: 2, display:'flex' }}>
 <BedIcon sx={{ color:'white' }} />
 </Box>
 <Box>
 <Box sx={{ display:'flex', alignItems:'center', gap: 1.5 }}>
 <Typography sx={{ color:'white', fontWeight: 800, fontSize:'18px' }}>
 Room {room.number} - Guest Details
 </Typography>
 {room.guest.vip && (
 <Box sx={{ backgroundColor:'#fef08a', color:'#854d0e', px: 1.25, py: 0.25, borderRadius: 1, fontSize:'11px', fontWeight: 700 }}>
 VIP Guest
 </Box>
 )}
 </Box>
 <Box sx={{ display:'flex', alignItems:'center', gap: 1, mt: 0.5 }}>
 <Box sx={{ width: 8, height: 8, borderRadius:'50%', backgroundColor: room.statusColor }} />
 <Typography sx={{ color:'rgba(255,255,255,0.85)', fontSize:'12px', fontWeight: 600, textTransform:'capitalize' }}>
 {room.status.toLowerCase()}
 </Typography>
 </Box>
 </Box>
 </Box>
 <IconButton onClick={onClose} sx={{ color:'white', backgroundColor:'rgba(255,255,255,0.1)','&:hover': { backgroundColor:'rgba(255,255,255,0.2)' } }}>
 <CloseIcon fontSize="small" />
 </IconButton>
 </Box>

 {/* CONTENT */}
 <DialogContent sx={{ p: 3, display:'flex', flexDirection:'column', gap: 2.5 }}>
 {/* Top Grid: 3 columns */}
 <Box sx={{ display:'grid', gridTemplateColumns: { xs:'1fr', md:'1fr 1fr 1fr' }, gap: 2.5 }}>
 {/* Col 1 */}
 <SectionCard title="Guest Information" icon={<PersonIcon sx={{ color:'#2e7d32', fontSize: 18 }} />}>
 <InfoBlock icon={<PersonIcon fontSize="small" />} label="Full Name" value={room.guest.name} />
 <InfoBlock icon={<LocationOnIcon fontSize="small" />} label="Address" value={room.guest.address || "123 Elm Street, Springfield"} />
 <InfoBlock icon={<PhoneIcon fontSize="small" />} label="Phone Number" value={room.guest.phone || "+1-555-1234"} />
 <InfoBlock icon={<EmailIcon fontSize="small" />} label="Email Address" value={room.guest.email || (room.guest.name ? `${room.guest.name.toLowerCase().replace(/ /g,"")}@example.com` : "")} />
 <InfoBlock icon={<CreditCardIcon fontSize="small" />} label="ID Number" value={room.guest.id} />
 <InfoBlock icon={<FlagIcon fontSize="small" />} label="Nationality" value={room.guest.nationality || "American"} />
 </SectionCard>

 {/* Col 2 */}
 <SectionCard title="Reservation Details" icon={<TagIcon sx={{ color:'#2e7d32', fontSize: 18 }} />}>
 <InfoBlock icon={<CheckInIcon fontSize="small" />} label="Check-In Date" valueNode={
 <Box>
 <Typography sx={{ fontSize:'13px', color:'#1e293b', fontWeight: 500 }}>{room.guest.checkIn ?`Thursday, ${room.guest.checkIn}, 2026` :'N/A'}</Typography>
 <Typography sx={{ fontSize:'11px', color:'#94a3b8', mt: 0.25 }}>15:00</Typography>
 </Box>
 } />
 <InfoBlock icon={<CheckOutIcon fontSize="small" />} label="Check-Out Date" valueNode={
 <Box>
 <Typography sx={{ fontSize:'13px', color:'#1e293b', fontWeight: 500 }}>{room.guest.checkOut ?`Wednesday, ${room.guest.checkOut}, 2026` :'N/A'}</Typography>
 <Typography sx={{ fontSize:'11px', color:'#94a3b8', mt: 0.25 }}>11:00</Typography>
 </Box>
 } />
 <InfoBlock icon={<TagIcon fontSize="small" />} label="Booking Reference" valueNode={
 <Typography sx={{ color:'#15803d', backgroundColor:'#dcfce7', display:'inline-block', px: 1, py: 0.25, borderRadius: 1, fontSize:'12px', fontWeight: 700 }}>{room.guest.bookingRef || "BK123CD456"}</Typography>
 } />
 <InfoBlock icon={<GlobeIcon fontSize="small" />} label="Booking Source" value={room.guest.bookingSource || "Direct"} />
 <InfoBlock icon={<PaymentIcon fontSize="small" />} label="Payment Status" valueNode={
 <Typography sx={{ color:'#15803d', backgroundColor:'#dcfce7', border:'1px solid #15803d', display:'inline-block', px: 1, py: 0.25, borderRadius: 1, fontSize:'11px', fontWeight: 700 }}>{room.guest.paymentStatus || "Paid"}</Typography>
 } />
 <InfoBlock icon={<AttachMoneyIcon fontSize="small" />} label="Total Amount" valueNode={
 <Typography sx={{ color:'#15803d', fontSize:'15px', fontWeight: 800 }}>${room.guest.checkIn ?'2240' :'0'}</Typography>
 } />
 </SectionCard>

 {/* Col 3 */}
 <SectionCard title="Room Details" icon={<BedIcon sx={{ color:'#2e7d32', fontSize: 18 }} />}>
 <InfoBlock icon={<BedIcon fontSize="small" />} label="Room Type" value={room.type} />
 <InfoBlock icon={<HotelIcon fontSize="small" />} label="Bed Configuration" value={room.bed} />
 <InfoBlock icon={<GroupIcon fontSize="small" />} label="Current Occupancy" value={`${room.adults} Adults, ${room.children} Children`} />
 <InfoBlock icon={<AttachMoneyIcon fontSize="small" />} label="Room Rate" valueNode={
 <Typography sx={{ color:'#d97706', fontSize:'13px', fontWeight: 700 }}>${room.price}/night</Typography>
 } />
 <InfoBlock icon={<FloorIcon fontSize="small" />} label="Floor" value={room.floor} />
 <InfoBlock icon={<CleanIcon fontSize="small" />} label="Housekeeping Status" valueNode={
 <Typography sx={{ color:'#0f766e', backgroundColor:'#ccfbf1', border:'1px solid #0f766e', display:'inline-block', px: 1, py: 0.25, borderRadius: 1, fontSize:'11px', fontWeight: 700 }}>{room.housekeeping}</Typography>
 } />

 <Box sx={{ mt: 3 }}>
 <Box sx={{ display:'flex', alignItems:'center', gap: 1, mb: 1.5, color:'#334155' }}>
 <StarIcon sx={{ color:'#f59e0b', fontSize: 16 }} />
 <Typography sx={{ fontWeight: 700, fontSize:'12px' }}>Room Amenities</Typography>
 </Box>
 <Box sx={{ display:'flex', flexWrap:'wrap', gap: 1 }}>
 {room.amenities && room.amenities.map(am => (
 <Box key={am} sx={{ display:'flex', alignItems:'center', gap: 0.5, backgroundColor:'#f8fafc', px: 1.5, py: 0.75, borderRadius: 1.5 }}>
 <CheckCircleIcon sx={{ color:'#10b981', fontSize: 14 }} />
 <Typography sx={{ fontSize:'11px', fontWeight: 600, color:'#334155', textTransform:'capitalize' }}>{am}</Typography>
 </Box>
 ))}
 </Box>
 </Box>
 </SectionCard>
 </Box>

 {/* Notes Panel */}
 <Box sx={{ backgroundColor:'white', borderRadius: 3, border:'1px solid #e2e8f0', p: 2.5 }}>
 <Box sx={{ display:'flex', alignItems:'center', gap: 1, mb: 2.5, color:'#334155' }}>
 <NotesIcon sx={{ color:'#2e7d32', fontSize: 18 }} />
 <Typography sx={{ fontWeight: 700, fontSize:'13px' }}>Notes & Special Requests</Typography>
 </Box>
 
 <Typography sx={{ fontSize:'10px', fontWeight: 700, color:'#64748b', textTransform:'uppercase', mb: 0.5, letterSpacing:'0.02em' }}>Special Requests</Typography>
 <Box sx={{ backgroundColor:'#f8fafc', p: 1.5, borderRadius: 2, mb: 2 }}>
 <Typography sx={{ fontSize:'12.5px', color:'#334155', fontWeight: 500 }}>{room.guest.specialRequests || "Late check-in, extra pillows"}</Typography>
 </Box>
 
 <Typography sx={{ fontSize:'10px', fontWeight: 700, color:'#64748b', textTransform:'uppercase', mb: 0.5, letterSpacing:'0.02em' }}>Internal Notes</Typography>
 <Box sx={{ backgroundColor:'#f8fafc', p: 1.5, borderRadius: 2 }}>
 <Typography sx={{ fontSize:'12.5px', color:'#334155', fontWeight: 500 }}>{room.note ||"No specific internal notes."}</Typography>
 </Box>
 </Box>

 {/* Loyalty Panel */}
 <Box sx={{ backgroundColor:'white', borderRadius: 3, border:'1px solid #e2e8f0', p: 2.5 }}>
 <Box sx={{ display:'flex', alignItems:'center', gap: 1, mb: 2, color:'#334155' }}>
 <TagIcon sx={{ color:'#2e7d32', fontSize: 18 }} />
 <Typography sx={{ fontWeight: 700, fontSize:'13px' }}>Loyalty Information</Typography>
 </Box>
 <Box sx={{ display:'grid', gridTemplateColumns: { xs:'1fr', sm:'1fr 1fr' }, gap: 2 }}>
 <Box sx={{ display:'flex', alignItems:'center', gap: 2, backgroundColor:'#fff7ed', border:'1px solid #ffedd5', p: 2, borderRadius: 2 }}>
 <VipIcon sx={{ color:'#ea580c', fontSize: 24 }} />
 <Box>
 <Typography sx={{ fontSize:'10px', fontWeight: 700, color:'#ea580c', textTransform:'uppercase', mb: 0.25, letterSpacing:'0.02em' }}>VIP Status</Typography>
 <Typography sx={{ fontSize:'14px', color:'#9a3412', fontWeight: 800 }}>{room.guest.vip ?'Premium Guest' :'Standard Guest'}</Typography>
 </Box>
 </Box>
 <Box sx={{ display:'flex', alignItems:'center', gap: 2, backgroundColor:'#fff7ed', border:'1px solid #ffedd5', p: 2, borderRadius: 2 }}>
 <PointsIcon sx={{ color:'#ea580c', fontSize: 24 }} />
 <Box>
 <Typography sx={{ fontSize:'10px', fontWeight: 700, color:'#ea580c', textTransform:'uppercase', mb: 0.25, letterSpacing:'0.02em' }}>Loyalty Points</Typography>
 <Typography sx={{ fontSize:'14px', color:'#9a3412', fontWeight: 800 }}>{room.guest.vip ?'1250 points' :'150 points'}</Typography>
 </Box>
 </Box>
 </Box>
 </Box>

 </DialogContent>

 {/* FOOTER */}
 <DialogActions sx={{ px: 3, py: 2, backgroundColor:'#ffffff', borderTop:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
 <Box sx={{ display:'flex', alignItems:'center', gap: 1, color:'#64748b' }}>
 <ClockIcon sx={{ fontSize: 16 }} />
 <Typography sx={{ fontSize:'11px', fontWeight: 500 }}>Last cleaned: 9/17/24, 8:00 AM</Typography>
 </Box>
 <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
 
          <Button onClick={onCheckout} startIcon={<ExitToAppIcon sx={{ fontSize: 16 }} />} sx={{ color: '#ef4444', textTransform: 'none', fontWeight: 700, fontSize: '13px', mr: 1 }}>
            Checkout Guest
          </Button>
          <Button onClick={onEdit} startIcon={<EditIcon sx={{ fontSize: 16 }} />} sx={{ color:'#16a34a', textTransform:'none', fontWeight: 700, fontSize:'13px' }}>
 Edit Guest Details
 </Button>
 <Button onClick={onClose} variant="contained" startIcon={<CloseIcon sx={{ fontSize: 16 }} />} sx={{ backgroundColor:'#16a34a', color:'white', textTransform:'none', fontWeight: 700, fontSize:'13px', px: 2.5, borderRadius: 2, boxShadow:'none','&:hover': { backgroundColor:'#15803d', boxShadow:'none' } }}>
 Close
 </Button>
 </Box>
 </DialogActions>
 </Dialog>
 );
}
