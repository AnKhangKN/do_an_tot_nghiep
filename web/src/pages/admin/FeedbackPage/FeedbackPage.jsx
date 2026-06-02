import React from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';

const feedbackColumns = [
  {
    key: 'index',
    title: 'STT',
    render: (_, index) => (
      <span className="text-gray-500">{index + 1}</span>
    ),
  },
  {
    key: 'user',
    title: 'Người dùng',
    dataIndex: 'user',
  },
  {
    key: 'content',
    title: 'Nội dung phản hồi',
    dataIndex: 'content',
  },
  {
    key: 'createdAt',
    title: 'Ngày gửi',
    render: (row) => (
      <span className="text-sm text-gray-500">
        {formatTime(row.createdAt)}
      </span>
    ),
  },
];

const reportColumns = [
  {
    key: 'index',
    title: 'STT',
    render: (_, index) => (
      <span className="text-gray-500">{index + 1}</span>
    ),
  },
  {
    key: 'reportedBy',
    title: 'Người báo cáo',
    dataIndex: 'reportedBy',
  },
  {
    key: 'reason',
    title: 'Lý do',
    dataIndex: 'reason',
  },
  {
    key: 'target',
    title: 'Đối tượng',
    dataIndex: 'target',
  },
  {
    key: 'createdAt',
    title: 'Ngày báo cáo',
    render: (row) => (
      <span className="text-sm text-gray-500">
        {formatTime(row.createdAt)}
      </span>
    ),
  },
];

const messageColumns = [
  {
    key: 'index',
    title: 'STT',
    render: (_, index) => (
      <span className="text-gray-500">{index + 1}</span>
    ),
  },
  {
    key: 'sender',
    title: 'Người gửi',
    dataIndex: 'sender',
  },
  {
    key: 'message',
    title: 'Tin nhắn',
    dataIndex: 'message',
  },
  {
    key: 'status',
    title: 'Trạng thái',
    render: (row) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.status === 'READ'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: 'createdAt',
    title: 'Ngày gửi',
    render: (row) => (
      <span className="text-sm text-gray-500">
        {formatTime(row.createdAt)}
      </span>
    ),
  },
];

const mockFeedbacks = [
  {
    id: '1',
    user: 'Nguyễn Văn A',
    content: 'Ứng dụng hoạt động rất tốt',
    createdAt: '2026-05-20T08:30:00',
  },
  {
    id: '2',
    user: 'Trần Thị B',
    content: 'Cần cải thiện tốc độ tải bản đồ',
    createdAt: '2026-05-18T14:10:00',
  },
];

const mockReports = [
  {
    id: '1',
    reportedBy: 'Lê Văn C',
    reason: 'Spam bình luận',
    target: 'Bài viết khu vực nguy hiểm',
    createdAt: '2026-05-17T10:00:00',
  },
  {
    id: '2',
    reportedBy: 'Phạm Thị D',
    reason: 'Thông tin sai lệch',
    target: 'Bình luận người dùng',
    createdAt: '2026-05-16T09:20:00',
  },
];

const mockMessages = [
  {
    id: '1',
    sender: 'Hoàng Văn E',
    message: 'Tôi cần hỗ trợ khẩn cấp',
    status: 'UNREAD',
    createdAt: '2026-05-20T11:00:00',
  },
  {
    id: '2',
    sender: 'Nguyễn Thị F',
    message: 'Cảm ơn đội cứu hộ',
    status: 'READ',
    createdAt: '2026-05-19T15:30:00',
  },
];

const FeedbackPage = () => {
  const [activeTab, setActiveTab] = React.useState('feedback');

  const renderContent = () => {
    switch (activeTab) {
      case 'feedback':
        return (
          <TableComponent
            columns={feedbackColumns}
            data={mockFeedbacks}
            rowKey="id"
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            loading={false}
          />
        );

      case 'report':
        return (
          <TableComponent
            columns={reportColumns}
            data={mockReports}
            rowKey="id"
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            loading={false}
          />
        );

      case 'message':
        return (
          <TableComponent
            columns={messageColumns}
            data={mockMessages}
            rowKey="id"
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            loading={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="">
      

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'feedback'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Phản hồi
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'report'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Báo cáo
        </button>

        <button
          onClick={() => setActiveTab('message')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'message'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tin nhắn
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default FeedbackPage;