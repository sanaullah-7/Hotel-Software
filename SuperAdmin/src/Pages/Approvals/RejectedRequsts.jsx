import { useState, useEffect, useCallback } from 'react';
import { ApprovalService } from '../../Services/ApprovlService.js';
import StatusBadge from '../../Components/Common/StatusBadge.jsx';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import EmptyState from '../../Components/Common/EmptyState.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import { formatDate } from '../../utils/ForamteDate.js';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants.js';
import { XCircle } from 'lucide-react';

export default function RejectedRequsts() {
  const [data,setData]=useState([]); const [total,setTotal]=useState(0); const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  const fetch=useCallback(async()=>{setLoading(true);setError('');try{const r=await ApprovalService.getApprovals({status:'REJECTED',page,limit:DEFAULT_PAGE_SIZE});setData(r.data);setTotal(r.total);}catch(e){setError(e.message);}finally{setLoading(false);};},[page]);
  useEffect(()=>{fetch();},[fetch]);
  return (
    <div className="animate-fadein">
      <PageHeader title="Rejected Applications" subtitle={`${total} application${total!==1?'s':''} rejected`} />
      {error?<ErrorState message={error} onRetry={fetch}/>:data.length===0&&!loading?<EmptyState icon={XCircle} title="No rejected applications" description="No applications have been rejected yet."/>:(
        <><div className="sa-table-wrap"><table className="sa-table"><thead><tr><th>Hotel</th><th>Manager</th><th>City</th><th>Rejected</th><th>Reason</th><th>Status</th></tr></thead><tbody>
          {loading?Array.from({length:5}).map((_,i)=><tr key={i}>{Array.from({length:6}).map((_,j)=><td key={j}><div className="skeleton" style={{height:13,borderRadius:6}}/></td>)}</tr>):
            data.map(item=><tr key={item.id}><td><div style={{fontWeight:600,fontSize:13}}>{item.hotelName}</div></td><td style={{fontSize:13}}>{item.managerName}</td><td style={{fontSize:13}}>{item.city}</td><td style={{fontSize:12.5,color:'var(--color-text-muted)'}}>{formatDate(item.rejectedAt)}</td><td style={{fontSize:12.5,color:'var(--color-error)',maxWidth:200}}>{item.rejectionReason||'—'}</td><td><StatusBadge status={item.status}/></td></tr>)}
        </tbody></table></div><Pagination page={page} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage}/></>
      )}
    </div>
  );
}
