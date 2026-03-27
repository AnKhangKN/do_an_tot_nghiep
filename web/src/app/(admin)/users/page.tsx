"use client";

import ButtonComponent from "@/components/ui/ButtonComponent/ButtonComponent";
import TableComponent from "@/components/ui/TableComponent/TableComponent";

type User = {
  id: number;
  name: string;
  email: string;
};

const users: User[] = [
  { id: 1, name: "Khang", email: "khang@gmail.com" },
  { id: 2, name: "An", email: "an@gmail.com" },
];

export default function Users() {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full text-end">
        <ButtonComponent>Thêm phương tiên mới</ButtonComponent>
      </div>

      <TableComponent
        data={users}
        columns={[
          { key: "id-col", dataKey: "id", title: "ID" },
          { key: "name-col", dataKey: "name", title: "Name" },
          { key: "email-col", dataKey: "email", title: "Email" },

          {
            key: "action-col",
            title: "Action",
            render: (row) => (
              <button onClick={() => alert(row.id)}>View</button>
            ),
          },
        ]}
      />
    </div>
  );
}
