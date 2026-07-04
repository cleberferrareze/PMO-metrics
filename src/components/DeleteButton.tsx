"use client";

export function DeleteButton({
  label = "Excluir",
  confirmMessage = "Tem certeza que deseja excluir?",
}: {
  label?: string;
  confirmMessage?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
      className="text-sm text-red-400 hover:text-red-300 hover:underline"
    >
      {label}
    </button>
  );
}
