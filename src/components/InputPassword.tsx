import { EyeIcon, EyeOffIcon } from "lucide-react";
import { forwardRef, useState } from "react";

type InputPasswordProps = React.InputHTMLAttributes<HTMLInputElement>

const  InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(({ id, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        {...props}
        ref={ref}
      />
      <button
        type="button"
        className="absolute right-0 top-0 p-2"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOffIcon size={24} /> : <EyeIcon size={24} />}
      </button>
    </div>
  )
})

InputPassword.displayName = 'InputPassword'

export default InputPassword