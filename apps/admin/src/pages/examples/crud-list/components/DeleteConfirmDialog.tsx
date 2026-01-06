import { Button } from "@pf-dev/ui";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@pf-dev/ui/organisms";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  count?: number;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "삭제 확인",
  description,
  isLoading,
  count = 1,
}: DeleteConfirmDialogProps) {
  const defaultDescription =
    count > 1
      ? `선택한 ${count}개 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      : "이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description ?? defaultDescription}</ModalDescription>
        </ModalHeader>
        <ModalBody />
        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            취소
          </Button>
          <Button variant="error" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "삭제 중..." : "삭제"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
