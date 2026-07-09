"use client";

import { useState } from "react";
import { CoordinatorPageHeader } from "@/components/coordenador/CoordinatorPageHeader";
import { EditUserModal } from "@/components/coordenador/EditUserModal";
import { NewUserModal } from "@/components/coordenador/NewUserModal";
import { UserTable } from "@/components/coordenador/UserTable";
import type { BaseUser, ClassGroup, Course } from "@/types/coordinator";

interface UsersPageContentProps {
  users: BaseUser[];
  courses: Course[];
  classes: ClassGroup[];
}

export const UsersPageContent = ({
  users,
  courses,
  classes,
}: UsersPageContentProps) => {
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BaseUser | null>(null);

  const handleCloseEditModal = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <CoordinatorPageHeader
        title="Usuários"
        subtitle="Gerencie os acessos de coordenadores, instrutores e alunos."
        action={
          <button
            type="button"
            onClick={() => setIsNewUserModalOpen(true)}
            className="h-11 w-full cursor-pointer rounded-lg bg-brand-dark px-5 font-semibold text-sm text-white transition-colors hover:bg-[#292E68] focus-visible:outline-2 focus-visible:outline-brand-dark focus-visible:outline-offset-2 sm:w-auto"
          >
            + Novo usuário
          </button>
        }
      />

      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        courses={courses}
        classes={classes}
      />

      <EditUserModal
        isOpen={selectedUser !== null}
        user={selectedUser}
        onClose={handleCloseEditModal}
      />

      <UserTable users={users} showActions onEdit={setSelectedUser} />
    </>
  );
};
