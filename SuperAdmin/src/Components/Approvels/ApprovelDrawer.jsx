import Drawer from '../Common/Drawer.jsx';
import ApprovelDetails from './ApprovelDetails.jsx';

export default function ApprovelDrawer({
  approval,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) {
  if (!approval) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Hotel Application Review">
      <ApprovelDetails
        approval={approval}
        onApprove={onApprove}
        onReject={onReject}
      />
    </Drawer>
  );
}
