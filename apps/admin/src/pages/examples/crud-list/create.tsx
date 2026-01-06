import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@pf-dev/ui";
import { UserFormData, UserForm } from "./components";

export function CrudListCreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Created user:", data);
    setIsLoading(false);
    navigate("/examples/crud-list");
  };

  const handleCancel = () => {
    navigate("/examples/crud-list");
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleCancel}>
          ← 목록으로
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 추가</h1>
          <p className="mt-1 text-sm text-gray-500">새로운 사용자 정보를 입력하세요.</p>
        </div>
      </div>

      {/* 폼 */}
      <div className="rounded-lg border bg-white p-6">
        <UserForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default CrudListCreatePage;
