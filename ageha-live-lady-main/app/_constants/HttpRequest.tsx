export class HttpRequest {
    static readonly METHOD_TYPE = {
        GET: "GET",
        POST: "POST",
        PATCH: "PATCH",
        DELETE: "DELETE",
    };
    static readonly HEADER_KEY_TYPE = {
        ACCEPT: "Accept",
        CONTENT_TYPE: "Content-Type",
    };
    static readonly CONTENT_TYPE = {
        JSON: "application/json; charset=utf-8",
        MULTIPART: "multipart/form-data; charset=utf-8",
    };
}