import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

type InputPasswordProps = {
  id: string;
}

export default function InputPassword({id}: InputPasswordProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  function togglePasswordVisibility() {
    setShowPassword((prev) => !prev)
  }

  return (
    <div className="relative">
      <input type={showPassword ? "text" : 'password'} id={id} />
      <span className="absolute right-3 top-3" onClick={togglePasswordVisibility}>
        {showPassword && <EyeIcon size={20} className="text-slate-600 cursor-pointer" />}
        {!showPassword && <EyeOffIcon
          className="text-slate-600 cursor-pointer"
          size={20}
        />}
      </span>
    </div>
  )
}