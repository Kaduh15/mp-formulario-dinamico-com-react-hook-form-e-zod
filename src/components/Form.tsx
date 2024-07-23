import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { withHookFormMask } from "use-mask-input";
import { z } from "zod";
import ErrorMessageForm from "./ErrorMessageForm";
import InputPassword from "./InputPassword";

function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) {
    return false;
  }

  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999'
  ];
  if (invalidCPFs.includes(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  const verifierDigit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cpf.charAt(9)) !== verifierDigit1) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  const verifierDigit2 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cpf.charAt(10)) !== verifierDigit2) {
    return false;
  }

  return true;
}


const formSchema = z.object({
  name: z.string().min(3, 'O nome deve ter mais 3 letras').max(255),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  password_confirmation: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  terms: z.boolean({
    required_error: 'Você deve aceitar os termos e condições'
  }).refine((data) => {
    console.log("🚀 ~ data:", data)
    return data
  }, {
    message: 'Você deve aceitar os termos e condições',
  }),
  phone: z.string().max(20),
  cpf: z.string().max(14),
  zipcode: z.string().max(9),
  address: z.string().max(255),
  city: z.string().max(255),
}).refine((data) => {
  if (data.password !== data.password_confirmation) {
    return false
  }

  return true
}, {
  message: 'As senhas devem ser iguais',
  path: ['password_confirmation'],
  params: {
    data: 'password_confirmation',
  }
})

export type FormSchema = z.infer<typeof formSchema>

export interface ResponseZipCode {
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

export interface ResponseSubmit {
  message: string
  user: User
}

export interface User {
  name: string
  email: string
  password: string
  password_confirmation: string
  terms: boolean
  phone: string
  cpf: string
  zipcode: string
  address: string
  city: string
}



export default function Form() {
  const [cpfMessageError, setCpfMessageError] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  })

  let zipCodeMessageError: string | undefined

  const zipCodeWithMask = withHookFormMask(register('zipcode'), '99999-999', {
    async oncomplete() {
      const { data, status } = await axios.get<ResponseZipCode>(`https://viacep.com.br/ws/${watch('zipcode')}/json/`)
      if (status !== 200) return zipCodeMessageError = 'CEP não encontrado'
      zipCodeMessageError = undefined
      setValue('city', data.localidade)
      console.log("🚀 ~ oncomplete ~ data:", data)
      setValue('address', data.logradouro || 'Sem dados')
    },
  })

  const cpfWithMask = withHookFormMask(register('cpf'), '999.999.999-99', {
    async oncomplete() {
      if (validateCPF(watch('cpf'))) {
        setCpfMessageError(undefined)
        return
      }
      setCpfMessageError('CPF inválido')
    }
  })

  const onSubmit = handleSubmit(async (data) => {
    console.log("🚀 ~ onSubmit ~ data:", data)

    const { data: dataResponse, status } = await axios.post<ResponseSubmit>('https://apis.codante.io/api/register-user/register', data)
    if (status !== 200) {
      console.log("🚀 ~ onSubmit ~ dataResponse:", dataResponse)
      alert(dataResponse)
      return

    }
    console.log("🚀 ~ onSubmit ~ dataResponse:", dataResponse)
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
        <ErrorMessageForm message={errors.password?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="confirm-password">Confirmar Senha</label>
        <InputPassword id="confirm-password" {...register('password_confirmation')} />
        <ErrorMessageForm message={errors.password_confirmation?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="phone">Telefone Celular</label>
        <input type="text" id="phone" {...register('phone')} />
      </div>
      <div className="mb-4">
        <label htmlFor="cpf">CPF</label>
        <input type="text" id="cpf" {...cpfWithMask} />
        <ErrorMessageForm message={cpfMessageError} />
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

          {...register('address')}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="city">Cidade</label>
        <input
          className="disabled:bg-slate-200"
          type="text"
          id="city"
          disabled

          {...register('city')}
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
        <ErrorMessageForm message={errors.terms?.message} />
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
