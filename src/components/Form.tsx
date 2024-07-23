import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ErrorMessageForm from "./ErrorMessageForm";
import InputPassword from "./InputPassword";
import { withHookFormMask } from "use-mask-input";
import axios from "axios";


const formSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  terms: z.boolean(),
  phone: z.string().max(20),
  cpf: z.string().max(14),
  zipCode: z.string().max(9),
  address: z.object({
    address: z.string().max(255),
    city: z.string().max(255),
  }),
  city: z.string().max(255),
})

export type FormSchema = z.infer<typeof formSchema>

export interface responseZipCode {
  cep: string
  logradouro: string
  complemento: string
  unidade: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}


export default function Form() {

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  })

  let zipCodeMessageError: string | undefined

  const zipCodeWithMask = withHookFormMask(register('zipCode'), '99999-999', {
    async oncomplete() {
      const { data, status } = await axios.get<responseZipCode>(`https://viacep.com.br/ws/${watch('zipCode')}/json/`)
      if (status !== 200) return zipCodeMessageError = 'CEP não encontrado'
      zipCodeMessageError = undefined
      setValue('address.city', data.localidade)
      console.log("🚀 ~ oncomplete ~ data:", data)
      setValue('address.address', data.logradouro || 'Sem dados')
    },
  })

  const onSubmit = handleSubmit((data) => {
    console.log("🚀 ~ onSubmit ~ data:", data)
  })


  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label htmlFor="name">Nome Completo</label>
        <input type="text" id="name" {...register('name')} />
        <ErrorMessageForm message={errors.name?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="email">E-mail</label>
        <input className="" type="email" id="email" {...register('email')} />
      </div>
      <div className="mb-4">
        <label htmlFor="password">Senha</label>
        <InputPassword id="password" {...register('password')} />
      </div>
      <div className="mb-4">
        <label htmlFor="confirm-password">Confirmar Senha</label>
        <InputPassword id="confirm-password" {...register('confirmPassword')} />
      </div>
      <div className="mb-4">
        <label htmlFor="phone">Telefone Celular</label>
        <input type="text" id="phone" {...register('phone')} />
      </div>
      <div className="mb-4">
        <label htmlFor="cpf">CPF</label>
        <input type="text" id="cpf" {...register('cpf')} />
      </div>
      <div className="mb-4">
        <label htmlFor="cep">CEP</label>
        <input type="text" id="cep" {...zipCodeWithMask} />
        <ErrorMessageForm message={zipCodeMessageError} />
      </div>
      <div className="mb-4">
        <label htmlFor="address">Endereço</label>
        <input
          className="disabled:bg-slate-200"
          type="text"
          id="address"
          disabled

          {...register('address.address')}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="city">Cidade</label>
        <input
          className="disabled:bg-slate-200"
          type="text"
          id="city"
          disabled

          {...register('address.city')}
        />
      </div>
      {/* terms and conditions input */}
      <div className="mb-4">
        <input type="checkbox" id="terms" className="mr-2 accent-slate-500" {...register('terms')} />
        <label
          className="text-sm  font-light text-slate-500 mb-1 inline"
          htmlFor="terms"
        >
          Aceito os{' '}
          <span className="underline hover:text-slate-900 cursor-pointer">
            termos e condições
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="bg-slate-500 font-semibold text-white w-full rounded-xl p-4 mt-10 hover:bg-slate-600 transition-colors"
      >
        Cadastrar
      </button>
    </form>
  );
}
