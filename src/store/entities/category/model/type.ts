// Тип для категории квеста
export interface CategoryResponse {
	id: number
	name: string
	createdAt?: string
	updatedAt?: string
}

// Тип для ответа API с категориями
export interface CategoriesResponse {
	categories: CategoryResponse[]
}

