type ErrorMessageFormProps = {
  message?: string;
}

export default function ErrorMessageForm({message}: ErrorMessageFormProps) {
  return (
    <div data-message={!!message} className="min-h-4 data-[message=false]:hidden">
      <p className="text-xs text-red-400 mt-1">{message}</p>
    </div>
  )
}