import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { message } from "antd";

type BaseQueryArgs    = string | FetchArgs;
type BaseQueryApi     = Parameters<BaseQueryFn>[1];
type ExtraOptions     = Parameters<BaseQueryFn>[2];

export const dynamicBaseQuery: BaseQueryFn<BaseQueryArgs, unknown, FetchBaseQueryError, object, FetchBaseQueryMeta> = async (args, WebApi: BaseQueryApi, extraOptions: ExtraOptions) => {
  const rawBaseQuery = fetchBaseQuery({
    // Set per environment via VITE_API_BASE_URL (see deploy-dev.sh / deploy-prod.sh).
    // Falls back to the dev API when the var is not provided.
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const result = await rawBaseQuery(args, WebApi, extraOptions);
  if (result?.error) {
    const errData = result.error.data as Record<string, string> | undefined;
    const responseMessage = errData?.error || errData?.message || 'An error occurred';
    const status = result?.error?.status;
    if (status === 401) {
      const rememberedEmails = localStorage.getItem("rememberedEmails");
      localStorage.clear();
      if (rememberedEmails) localStorage.setItem("rememberedEmails", rememberedEmails);
      window.location.replace("/login");
    } else {
      message.error(responseMessage);
    }
  }
  if (result?.data) {
    const res = result.data as Record<string, unknown>;
    const msg = (res?.message || res?.msg || null) as string | null;
    const successFlag = res?.success ?? res?.status ?? null;

    if (msg) {
      // Determine whether to show success or error depending on common flag shapes
      if (successFlag === false || successFlag === 0) {
        message.error(msg);
      } else {
        // treat missing/true/positive values as success
        message.success(msg);
      }
    }
  }
  return result;
};
