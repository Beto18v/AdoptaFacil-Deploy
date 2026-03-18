import{r as g,j as e}from"./app-QsHXuDV3.js";import{L as p,I as m}from"./label-Dv608TON.js";import{B as v}from"./badge-7bpFErkl.js";import{B as b}from"./button-CuI_KQDq.js";import{D as j,b as w,c as N,d as E,e as C}from"./dialog-Bt775ch_.js";import{I as z}from"./input-D4k6H_QF.js";import{T as D}from"./textarea-Cb1YUn_f.js";import"./index-CVkPs9CU.js";import"./index-D9suuIYC.js";import"./Combination-CVZljAzN.js";import"./index-DlHvnU-2.js";import"./x-DP6e_bU8.js";import"./createLucideIcon-CudieZ-0.js";const y=a=>a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),$=(a,s)=>{const d=typeof window>"u"?"https://adoptafacil.com":window.location.origin,r=y(a.trim()||"Asunto del correo"),i=y(s.trim()||"Escribe aqui el mensaje que quieres enviar a los usuarios seleccionados.").replace(/\n/g,"<br>");return`
        <!doctype html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${r}</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif; color:#111827;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:24px 12px;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; padding:24px;">
                            <tr>
                                <td align="center" style="padding-bottom:16px;">
                                    <img src="${d}/Logo/LogoGreen.png" alt="AdoptaFacil" style="max-width:180px; height:auto; border:0;" />
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:24px; font-weight:700; line-height:1.3; padding-bottom:16px;">
                                    Hola comunidad,
                                </td>
                            <tr>
                                <td style="font-size:16px; line-height:1.6; padding-bottom:16px;">
                                    ${i}
                                </td>
                            </tr>
                            <tr>
                                <td style="background:#f3f4f6; border-radius:6px; padding:12px 16px; font-size:15px; line-height:1.5; color:#374151;">
                                    Gracias por seguir conectado con AdoptaFacil.
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:14px; line-height:1.6; color:#6b7280; padding-top:12px;">
                                    Este envio se realizara en copia oculta (BCC) a los destinatarios seleccionados.
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-top:24px; padding-bottom:16px;">
                                    <a href="${d}" style="display:inline-block; background:#16a34a; color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; padding:12px 20px; border-radius:6px;">
                                        Visitar AdoptaFacil
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `};function P({errors:a,onOpenChange:s,onSubmit:d,open:r,processing:i=!1,recipients:o}){const[n,u]=g.useState(""),[c,x]=g.useState(""),[f,h]=g.useState(!1);g.useEffect(()=>{r||(u(""),x(""),h(!1))},[r]);const k=f?o:o.slice(0,2),l=o.length;return e.jsx(j,{open:r,onOpenChange:s,children:e.jsxs(w,{className:"fixed top-[50%] left-[50%] z-50 w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] rounded-3xl bg-white/95 p-0 shadow-2xl backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=open]:zoom-in-95 dark:bg-gray-800/95",children:[e.jsx("div",{className:"pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/15 to-transparent"}),e.jsx("div",{className:"pointer-events-none absolute top-1/3 -left-8 h-20 w-20 rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent"}),e.jsx("div",{className:"pointer-events-none absolute right-1/4 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-tl from-purple-500/8 to-transparent"}),e.jsxs("div",{className:"scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-600 relative max-h-[calc(100vh-4rem)] overflow-y-auto p-8",children:[e.jsxs(N,{className:"mb-8",children:[e.jsx(E,{className:"bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-green-400 dark:via-blue-400 dark:to-purple-400",children:"Enviar Correo Masivo"}),e.jsx(C,{className:"mt-2 text-lg text-gray-600 dark:text-gray-300",children:"Envia un correo electronico masivo en copia oculta para proteger los destinatarios seleccionados."})]}),e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50",children:[e.jsxs(p,{className:"flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200",children:["Destinatarios (",l,")"]}),e.jsxs("div",{className:"mt-4 flex flex-wrap gap-3",children:[k.map(t=>e.jsx(v,{variant:"secondary",className:"border border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 text-blue-800 shadow-sm dark:border-blue-700/50 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-200",children:`${t.name} <${t.email}>`},t.id)),o.length>2&&e.jsx(b,{size:"sm",type:"button",variant:"outline",onClick:()=>h(t=>!t),className:"border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-600/50 dark:bg-blue-900/30 dark:text-blue-400",children:f?"Ver menos":`Ver todos (${o.length-2})`})]}),e.jsx(m,{className:"mt-3",message:a==null?void 0:a.user_ids})]}),e.jsxs("div",{className:"rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50",children:[e.jsx(p,{htmlFor:"bulk-email-subject",className:"flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200",children:"Asunto del Correo"}),e.jsx(z,{id:"bulk-email-subject",placeholder:"Ej: Nuevas mascotas disponibles para adopcion",value:n,onChange:t=>u(t.target.value),className:"mt-3 border-2 border-green-200 bg-white shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-green-400"}),e.jsx(m,{className:"mt-3",message:a==null?void 0:a.subject})]}),e.jsxs("div",{className:"rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50",children:[e.jsx(p,{htmlFor:"bulk-email-description",className:"flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200",children:"Mensaje del Correo"}),e.jsx(D,{id:"bulk-email-description",placeholder:"Escribe aqui el mensaje que quieres enviar a los usuarios seleccionados....",value:c,onChange:t=>x(t.target.value),rows:6,className:"mt-3 border-2 border-purple-200 bg-white shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-purple-400"}),e.jsx(m,{className:"mt-3",message:a==null?void 0:a.description})]}),e.jsxs("div",{className:"rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6 dark:from-gray-700/50 dark:to-gray-600/50",children:[e.jsx(p,{className:"flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200",children:"Previsualizacion del Correo"}),e.jsx("div",{className:"mt-4 overflow-hidden rounded-2xl border-2 border-yellow-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700",children:e.jsx("iframe",{srcDoc:$(n,c),className:"w-full rounded-2xl border-0",style:{height:"450px"},title:"Bulk email preview"})})]})]}),e.jsxs("div",{className:"flex items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-600",children:[e.jsx("div",{className:"text-sm text-gray-500 dark:text-gray-400",children:l>0?`Se enviara por copia oculta a ${l} destinatario${l!==1?"s":""}`:"Selecciona al menos un destinatario"}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx(b,{variant:"outline",type:"button",onClick:()=>s(!1),className:"border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",children:"Cancelar"}),e.jsx(b,{type:"button",onClick:()=>d({description:c,subject:n}),disabled:!n.trim()||!c.trim()||l===0||i,className:"bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:from-green-600 dark:to-green-800",children:i?"Enviando...":"Enviar Correo Masivo"})]})]})]})]})})}export{P as default};
