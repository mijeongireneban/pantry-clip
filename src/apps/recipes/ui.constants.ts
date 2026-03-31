import type { Language } from "@/src/apps/recipes/ui.types";
import type { SummarizeJobStatus } from "@/src/apps/recipes/recipes.types";

export const LANGUAGE_STORAGE_KEY = "pantryclip-language";

export const copy = {
  ko: {
    bottomNav: {
      library: "보관함",
      add: "추가",
      scrap: "저장됨",
      profile: "프로필"
    },
    sourceBadge: {
      youtube: "유튜브",
      instagram: "인스타그램",
      link: "링크",
      ai: "AI"
    },
    auth: {
      welcomeBack: "다시 오신 것을 환영합니다",
      createAccount: "계정을 만들어보세요",
      signInDescription: "계정에 로그인하고 PantryClip을 계속 사용하세요.",
      signUpDescription: "짧은 요리 영상을 나만의 레시피로 저장해보세요.",
      email: "이메일",
      password: "비밀번호",
      forgotPassword: "비밀번호 찾기",
      loading: "로딩 중...",
      login: "로그인",
      createAccountCta: "계정 만들기",
      orContinueWith: "또는 다른 방법으로 계속",
      socialComingSoon: "소셜 로그인은 곧 지원됩니다",
      dontHaveAccount: "계정이 없으신가요?",
      alreadyHaveAccount: "이미 계정이 있으신가요?",
      signUpSwitch: "회원가입",
      signInSwitch: "로그인",
      signUpNotice:
        "계정이 생성되었습니다. 이메일을 확인하여 인증을 완료해주세요.",
      authFailed: "인증에 실패했습니다."
    },
    library: {
      title: "내 레시피",
      subtitle: "나만의 요리 컬렉션을 관리하고 새로운 맛을 탐험하세요.",
      addRecipe: "레시피 추가",
      searchPlaceholder: "레시피 검색...",
      loadError: "레시피를 불러오지 못했습니다.",
      recentRecipes: "최근 레시피",
      searchResults: "검색 결과",
      noRecipes: "아직 레시피가 없어요",
      noRecipesDescription: "링크를 붙여넣어 첫 번째 레시피를 추가해보세요.",
      noMatches: "검색 결과가 없어요",
      noMatchesDescription: "다른 검색어를 사용해보세요.",
      tipLabel: "오늘의 레시피 팁",
      tipTitle: "식재료의 풍미를 극대화하는 시어링 기법",
      tipBody:
        "고기나 식재료를 높은 온도에서 빠르게 익혀 마이야르 반응을 일으키는 것은 작은 온도에서 삶는 것과의 차이를 결정하는 핵심입니다. 팬을 충분히 예열하는 것부터 시작하세요.",
      tipCta: "전문 셰프 가이드 보기",
      aiBannerLabel: "AI 레시피 생성기",
      aiBannerTitle: "새로운 레시피를 오늘 AI로 생성해보세요",
      aiBannerCta: "바로 시작"
    },
    add: {
      title: "레시피 추가",
      eyebrow: "새 레시피",
      aiSupportLabel: "현재 AI 지원",
      aiSupportTitle: "유튜브 쇼츠만 지원",
      aiSupportDescription:
        "AI 초안 생성은 현재 유튜브 쇼츠 링크에서만 동작합니다. 다른 링크도 수동으로 저장할 수 있어요.",
      urlRequired: "URL을 입력해주세요.",
      urlProtocol: "http:// 또는 https://로 시작하는 URL을 입력해주세요.",
      aiOnlySupport:
        "AI 초안 생성은 현재 유튜브 쇼츠만 지원합니다. 그래도 수동으로 계속할 수 있어요.",
      insufficientContext:
        "영상에서 레시피 정보를 충분히 추출하지 못했습니다. 직접 입력으로 계속해주세요.",
      aiFailed: "AI 초안 생성에 실패했습니다. 직접 입력으로 계속해주세요.",
      delayed: "초안 생성이 지연되고 있습니다. 직접 입력으로 계속해주세요.",
      saveUrlOnlyFailed: "링크 저장에 실패했습니다.",
      saveUrlOnlySuccess:
        "링크가 저장되었습니다. 세부 내용은 나중에 수정할 수 있어요.",
      generateWithAi: "AI로 초안 만들기",
      saveUrlOnly: "URL만 저장",
      savingUrlOnly: "링크 저장 중...",
      reviewDraft: "초안 검토",
      draft: "초안",
      titleLabel: "제목",
      titlePlaceholder: "레시피 제목",
      ingredientsLabel: "재료",
      preparationLabel: "조리 과정",
      cancel: "취소",
      saveToLibrary: "보관함에 저장"
    },
    manual: {
      title: "새 레시피",
      eyebrow: "직접 작성",
      sourceUrl: "원본 URL",
      titleLabel: "제목",
      titlePlaceholder: "레시피 제목",
      ingredientsLabel: "재료",
      preparationLabel: "조리 과정",
      cancel: "취소",
      saveToLibrary: "보관함에 저장"
    },
    edit: {
      title: "레시피 수정",
      badge: "수정",
      sourceUrl: "원본 URL",
      titleLabel: "제목",
      ingredientsLabel: "재료",
      preparationLabel: "조리 과정",
      cancel: "취소",
      saveChanges: "변경 사항 저장",
      success: "레시피가 수정되었습니다",
      failure: "수정 실패"
    },
    detail: {
      title: "레시피 상세",
      ingredients: "재료",
      preparation: "조리 과정",
      noIngredients:
        "아직 재료가 없습니다. 수정 화면에서 나중에 추가할 수 있어요.",
      noSteps:
        "아직 조리 과정이 없습니다. 링크를 먼저 저장하고 나중에 정리해도 됩니다.",
      collections: "컬렉션",
      edit: "수정",
      delete: "삭제"
    },
    saved: {
      title: "저장됨",
      subtitle: "저장한 레시피 모음입니다.",
      allRecipes: "전체",
      createCollection: "컬렉션 만들기",
      manageCollections: "편집",
      collectionNameLabel: "컬렉션 이름",
      collectionNamePlaceholder: "예: 주말 브런치",
      createCollectionTitle: "새 컬렉션",
      createCollectionDescription:
        "저장한 레시피를 주제별로 모아볼 수 있는 컬렉션을 만들어보세요.",
      renameCollectionTitle: "컬렉션 이름 변경",
      renameCollectionDescription: "컬렉션 이름을 새롭게 정리해보세요.",
      manageCollectionsTitle: "컬렉션 관리",
      manageCollectionsDescription:
        "이 레시피를 포함할 컬렉션을 선택하세요. 모두 해제하면 저장됨에서 빠집니다.",
      editCollectionsTitle: "컬렉션 편집",
      editCollectionsDescription:
        "사용자 컬렉션의 이름을 바꾸거나 삭제할 수 있어요.",
      renameCollection: "이름 변경",
      deleteCollection: "삭제",
      defaultCollectionBadge: "기본",
      customCollectionsEmpty: "아직 만든 컬렉션이 없습니다",
      customCollectionsEmptyDescription:
        "먼저 컬렉션을 만들고 레시피를 묶어보세요.",
      deleteCollectionTitle: "컬렉션 삭제",
      deleteCollectionDescription:
        '"{title}" 컬렉션을 삭제할까요? 이 컬렉션에만 있던 레시피는 저장됨에서 빠집니다.',
      noRecipesInCollection: "이 컬렉션에는 아직 레시피가 없어요",
      noRecipesInCollectionDescription:
        "레시피 상세에서 컬렉션에 추가하면 여기에서 볼 수 있어요.",
      emptyTitle: "저장된 레시피가 없습니다",
      emptyDescription: "레시피 상세 페이지에서 북마크 버튼을 눌러보세요."
    },
    profile: {
      recipesSaved: "저장된 레시피 {count}개",
      themeTitle: "테마",
      themeDescription:
        "앱 화면을 밝은 테마 또는 어두운 테마로 전환할 수 있어요.",
      languageTitle: "앱 언어",
      languageDescription:
        "화면의 안내 문구와 버튼 텍스트를 한국어 또는 영어로 바꿀 수 있어요.",
      light: "라이트",
      dark: "다크",
      korean: "한국어",
      english: "영어",
      signOut: "로그아웃"
    },
    actions: {
      recipeSaved: "레시피가 저장되었습니다",
      saveFailed: "저장 실패",
      deleted: "레시피가 삭제되었습니다",
      deleteFailed: "삭제 실패",
      savedOn: "저장됨",
      unsaved: "저장 해제됨",
      collectionCreated: "컬렉션이 생성되었습니다",
      collectionsUpdated: "컬렉션이 업데이트되었습니다",
      collectionRenamed: "컬렉션 이름이 변경되었습니다",
      collectionDeleted: "컬렉션이 삭제되었습니다"
    },
    deleteModal: {
      title: "레시피 삭제",
      description: '"{title}"을 삭제할까요? 되돌릴 수 없습니다.',
      cancel: "취소",
      delete: "삭제"
    },
    editors: {
      ingredientPlaceholder: "재료 {count}",
      addIngredient: "재료 추가",
      stepPlaceholder: "{count}단계 설명",
      addStep: "단계 추가"
    }
  },
  en: {
    bottomNav: {
      library: "LIBRARY",
      add: "ADD",
      scrap: "SAVED",
      profile: "PROFILE"
    },
    sourceBadge: {
      youtube: "YouTube",
      instagram: "Instagram",
      link: "Link",
      ai: "AI"
    },
    auth: {
      welcomeBack: "Welcome back",
      createAccount: "Create account",
      signInDescription: "Sign in to continue using PantryClip.",
      signUpDescription: "Save short cooking videos as your own recipes.",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot Password?",
      loading: "Loading...",
      login: "Login",
      createAccountCta: "Create Account",
      orContinueWith: "or continue with",
      socialComingSoon: "Social login coming soon",
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
      signUpSwitch: "Sign Up",
      signInSwitch: "Sign In",
      signUpNotice:
        "Your account was created. Please check your email to confirm it.",
      authFailed: "Authentication failed."
    },
    library: {
      title: "My Recipes",
      subtitle:
        "Manage your personal recipe collection and explore new flavors.",
      addRecipe: "Add Recipe",
      searchPlaceholder: "Search recipes...",
      loadError: "Failed to load recipes.",
      recentRecipes: "Recent Recipes",
      searchResults: "Search Results",
      noRecipes: "No recipes yet",
      noRecipesDescription: "Paste a link to add your first recipe.",
      noMatches: "No matches",
      noMatchesDescription: "Try a different search.",
      tipLabel: "Recipe Tip of the Day",
      tipTitle: "Searing technique to maximize ingredient flavor",
      tipBody:
        "Quickly searing meat or other ingredients over high heat creates the Maillard reaction and changes the final dish dramatically. Start by preheating the pan properly.",
      tipCta: "Check Professional Chef Guide",
      aiBannerLabel: "AI Recipe Generator",
      aiBannerTitle: "Generate your next recipe draft with AI today",
      aiBannerCta: "START NOW"
    },
    add: {
      title: "Add Recipe",
      eyebrow: "Add New Recipe",
      aiSupportLabel: "Current AI Support",
      aiSupportTitle: "YouTube Shorts only",
      aiSupportDescription:
        "AI draft generation currently works only with YouTube Shorts links. Other links can still be saved manually.",
      urlRequired: "Please enter a URL.",
      urlProtocol: "Please enter a URL starting with http:// or https://.",
      aiOnlySupport:
        "AI draft generation currently supports YouTube Shorts only. You can still continue manually.",
      insufficientContext:
        "We couldn't extract enough recipe information from this video. Please continue manually.",
      aiFailed: "AI draft generation failed. Please continue manually.",
      delayed:
        "Draft generation is taking longer than expected. Please continue manually.",
      saveUrlOnlyFailed: "Failed to save the link.",
      saveUrlOnlySuccess:
        "The link was saved. You can add the recipe details later.",
      generateWithAi: "Generate with AI",
      saveUrlOnly: "Save URL Only",
      savingUrlOnly: "Saving URL...",
      reviewDraft: "Review Draft",
      draft: "Draft",
      titleLabel: "Title",
      titlePlaceholder: "Recipe title",
      ingredientsLabel: "Ingredients",
      preparationLabel: "Preparation",
      cancel: "Cancel",
      saveToLibrary: "Save to Library"
    },
    manual: {
      title: "New Recipe",
      eyebrow: "Write manually",
      sourceUrl: "Source URL",
      titleLabel: "Title",
      titlePlaceholder: "Recipe title",
      ingredientsLabel: "Ingredients",
      preparationLabel: "Preparation",
      cancel: "Cancel",
      saveToLibrary: "Save to Library"
    },
    edit: {
      title: "Edit Recipe",
      badge: "Edit",
      sourceUrl: "Source URL",
      titleLabel: "Title",
      ingredientsLabel: "Ingredients",
      preparationLabel: "Preparation",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      success: "Recipe updated",
      failure: "Update failed"
    },
    detail: {
      title: "Recipe Details",
      ingredients: "Ingredients",
      preparation: "Preparation",
      noIngredients: "No ingredients yet. You can add them later from Edit.",
      noSteps:
        "No preparation steps yet. You can save the link first and organize it later.",
      collections: "Collections",
      edit: "Edit",
      delete: "Delete"
    },
    saved: {
      title: "Saved",
      subtitle: "Your saved recipes collection.",
      allRecipes: "All",
      createCollection: "New Collection",
      manageCollections: "Manage",
      collectionNameLabel: "Collection name",
      collectionNamePlaceholder: "e.g. Weekend Brunch",
      createCollectionTitle: "Create Collection",
      createCollectionDescription:
        "Create a collection to organize saved recipes by theme or occasion.",
      renameCollectionTitle: "Rename Collection",
      renameCollectionDescription: "Give this collection a clearer name.",
      manageCollectionsTitle: "Manage Collections",
      manageCollectionsDescription:
        "Choose which collections should include this recipe. Clear all to unsave it.",
      editCollectionsTitle: "Edit Collections",
      editCollectionsDescription:
        "Rename or delete your custom collections here.",
      renameCollection: "Rename",
      deleteCollection: "Delete",
      defaultCollectionBadge: "Default",
      customCollectionsEmpty: "No custom collections yet",
      customCollectionsEmptyDescription:
        "Create your first collection to organize saved recipes.",
      deleteCollectionTitle: "Delete Collection",
      deleteCollectionDescription:
        'Delete "{title}"? Recipes that only live here will be removed from Saved.',
      noRecipesInCollection: "No recipes in this collection yet",
      noRecipesInCollectionDescription:
        "Add this recipe from the detail view and it will show up here.",
      emptyTitle: "No saved recipes yet",
      emptyDescription: "Use the bookmark button on a recipe detail page."
    },
    profile: {
      recipesSaved: "{count} recipes saved",
      themeTitle: "Theme",
      themeDescription: "Switch the app between light and dark appearance.",
      languageTitle: "App language",
      languageDescription:
        "Switch interface copy and buttons between Korean and English. Recipe content stays as originally generated or written.",
      light: "Light",
      dark: "Dark",
      korean: "Korean",
      english: "English",
      signOut: "Sign Out"
    },
    actions: {
      recipeSaved: "Recipe saved",
      saveFailed: "Save failed",
      deleted: "Recipe deleted",
      deleteFailed: "Delete failed",
      savedOn: "Saved",
      unsaved: "Removed from saved",
      collectionCreated: "Collection created",
      collectionsUpdated: "Collections updated",
      collectionRenamed: "Collection renamed",
      collectionDeleted: "Collection deleted"
    },
    deleteModal: {
      title: "Delete Recipe",
      description: 'Delete "{title}"? This cannot be undone.',
      cancel: "Cancel",
      delete: "Delete"
    },
    editors: {
      ingredientPlaceholder: "Ingredient {count}",
      addIngredient: "Add ingredient",
      stepPlaceholder: "Describe step {count}",
      addStep: "Add step"
    }
  }
} as const;

export type UiCopy = typeof copy;

export function replaceCount(template: string, count: number) {
  return template.replace("{count}", String(count));
}

export function replaceTitle(template: string, title: string) {
  return template.replace("{title}", title);
}

export function toSummarizeStatusLabel(
  status: SummarizeJobStatus | null,
  language: Language
) {
  if (language === "ko") {
    if (status === "queued") return "대기 중...";
    if (status === "extracting") return "추출 중...";
    if (status === "summarizing") return "생성 중...";
    return "생성 중...";
  }

  if (status === "queued") return "Queueing...";
  if (status === "extracting") return "Extracting...";
  if (status === "summarizing") return "Generating...";
  return "Generating...";
}
