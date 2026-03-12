export class CreatePageDto {
  title: string;
  icon?: string;
  coverImage?: string;
  content?: any;
  parentPageId?: string;
  workspaceId: string;
}
