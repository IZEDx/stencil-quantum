
export type APISchema = {
    "/user/:id": {
        GET: {
            params: {
                id: string
            },
            response: {
                name: string;
            }
        }
    }
}