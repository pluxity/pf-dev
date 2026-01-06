import { useState, useMemo, useCallback } from "react";
import { Button } from "@pf-dev/ui/atoms";
import { Plus } from "@pf-dev/ui/atoms";
import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import { CardList } from "@pf-dev/ui/organisms";
import { ItemCard, ItemFormModal, DeleteConfirmDialog } from "./components";
import type { Item, ItemFormData, FilterStatus } from "./types";

// 샘플 데이터
const STATUSES: Item["status"][] = ["active", "inactive", "draft"];
const SAMPLE_ITEMS: Item[] = Array.from({ length: 23 }, (_, i) => ({
  id: `item-${i + 1}`,
  title: `샘플 항목 ${i + 1}`,
  description: `이것은 샘플 항목 ${i + 1}의 설명입니다. 카드형 CRUD 페이지 템플릿의 예시 데이터입니다.`,
  thumbnail: i % 3 === 0 ? `https://picsum.photos/seed/${i + 1}/400/300` : undefined,
  status: STATUSES[i % 3]!,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
}));

const ITEMS_PER_PAGE = 9;

export function CrudCardPage() {
  const [items, setItems] = useState<Item[]>(SAMPLE_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // 모달 상태
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 필터링된 아이템
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, filterStatus]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // 핸들러
  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: Item) => {
    setSelectedItem(item);
    setFormModalOpen(true);
  }, []);

  const handleDelete = useCallback((item: Item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: ItemFormData) => {
      setIsLoading(true);
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (selectedItem) {
        // 수정
        setItems((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          )
        );
      } else {
        // 생성
        const newItem: Item = {
          id: `item-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setItems((prev) => [newItem, ...prev]);
      }

      setIsLoading(false);
      setFormModalOpen(false);
    },
    [selectedItem]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    // 실제 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));

    setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
    setIsLoading(false);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  }, [selectedItem]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">카드형 CRUD</h1>
          <p className="mt-1 text-sm text-gray-500">총 {filteredItems.length}개의 항목</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size="sm" />
          <span className="ml-1">새 항목</span>
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 flex items-center gap-4">
        <SearchBar
          placeholder="검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          onClear={() => handleSearch("")}
          className="w-80"
        />
        <div className="flex gap-2">
          {(["all", "active", "inactive", "draft"] as FilterStatus[]).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
            >
              {status === "all" && "전체"}
              {status === "active" && "활성"}
              {status === "inactive" && "비활성"}
              {status === "draft" && "초안"}
            </Button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="min-h-0 flex-1 overflow-auto">
        {paginatedItems.length > 0 ? (
          <CardList
            data={paginatedItems}
            renderCard={(item) => (
              <ItemCard item={item} onEdit={handleEdit} onDelete={handleDelete} />
            )}
            keyExtractor={(item) => item.id}
            columns={3}
            gap={24}
          />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-400">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* 모달 */}
      <ItemFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        item={selectedItem}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        item={selectedItem}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}
