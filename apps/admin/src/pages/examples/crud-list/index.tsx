import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@pf-dev/ui";
import { SearchBar } from "@pf-dev/ui/molecules";
import { DataTable } from "@pf-dev/ui/organisms";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from "@pf-dev/ui/organisms";
import { User, UserFormData, getUserColumns, UserForm, DeleteConfirmDialog } from "./components";

// 더미 데이터
const initialUsers: User[] = [
  {
    id: 1,
    name: "김철수",
    email: "kim@example.com",
    department: "Engineering",
    role: "Developer",
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "이영희",
    email: "lee@example.com",
    department: "Design",
    role: "Designer",
    status: "active",
    joinDate: "2024-02-20",
  },
  {
    id: 3,
    name: "박지성",
    email: "park@example.com",
    department: "Marketing",
    role: "Manager",
    status: "inactive",
    joinDate: "2023-11-10",
  },
  {
    id: 4,
    name: "최민수",
    email: "choi@example.com",
    department: "Engineering",
    role: "Lead",
    status: "active",
    joinDate: "2023-08-05",
  },
  {
    id: 5,
    name: "정수연",
    email: "jung@example.com",
    department: "Sales",
    role: "Analyst",
    status: "pending",
    joinDate: "2024-03-01",
  },
  {
    id: 6,
    name: "강민지",
    email: "kang@example.com",
    department: "HR",
    role: "Specialist",
    status: "active",
    joinDate: "2024-01-08",
  },
  {
    id: 7,
    name: "윤서준",
    email: "yoon@example.com",
    department: "Engineering",
    role: "Developer",
    status: "active",
    joinDate: "2023-12-12",
  },
  {
    id: 8,
    name: "임하늘",
    email: "lim@example.com",
    department: "Design",
    role: "Designer",
    status: "inactive",
    joinDate: "2023-06-22",
  },
  {
    id: 9,
    name: "한지민",
    email: "han@example.com",
    department: "Marketing",
    role: "Analyst",
    status: "active",
    joinDate: "2024-02-14",
  },
  {
    id: 10,
    name: "오준혁",
    email: "oh@example.com",
    department: "Engineering",
    role: "Intern",
    status: "pending",
    joinDate: "2024-03-10",
  },
  {
    id: 11,
    name: "서예진",
    email: "seo@example.com",
    department: "Sales",
    role: "Manager",
    status: "active",
    joinDate: "2023-09-18",
  },
  {
    id: 12,
    name: "조은우",
    email: "jo@example.com",
    department: "HR",
    role: "Director",
    status: "active",
    joinDate: "2023-04-25",
  },
];

export function CrudListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 검색 필터링
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // 핸들러
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (data: UserFormData) => {
    if (!editingUser) return;

    setIsLoading(true);
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));

    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u)));
    setIsLoading(false);
    setEditModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (deletingUser) {
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    } else if (selectedUsers.length > 0) {
      const selectedIds = new Set(selectedUsers.map((u) => u.id));
      setUsers((prev) => prev.filter((u) => !selectedIds.has(u.id)));
      setSelectedUsers([]);
    }

    setIsLoading(false);
    setDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const handleBulkDelete = () => {
    setDeletingUser(null);
    setDeleteDialogOpen(true);
  };

  const columns = getUserColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="mt-1 text-sm text-gray-500">사용자 목록을 조회하고 관리할 수 있습니다.</p>
        </div>
        <Button onClick={() => navigate("/examples/crud-list/create")}>+ 사용자 추가</Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center gap-4">
        <div className="w-80">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 이메일, 부서로 검색..."
          />
        </div>
        {selectedUsers.length > 0 && (
          <Button variant="error" onClick={handleBulkDelete}>
            선택 삭제 ({selectedUsers.length})
          </Button>
        )}
      </div>

      {/* 데이터 테이블 */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        selectable
        pagination
        pageSize={10}
        onSelectionChange={setSelectedUsers}
      />

      {/* 수정 모달 */}
      <Modal open={editModalOpen} onOpenChange={setEditModalOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>사용자 수정</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {editingUser && (
              <UserForm
                initialData={editingUser}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditModalOpen(false)}
                isLoading={isLoading}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
        count={deletingUser ? 1 : selectedUsers.length}
      />
    </div>
  );
}

export default CrudListPage;
