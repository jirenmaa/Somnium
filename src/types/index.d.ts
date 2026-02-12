declare interface Params {
  params: Promise<Record<string, string>>;
}

declare interface SearchParams {
  searchParams: Promise<Record<string, string | undefined>>;
}

declare type VideoItem = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  thumbnailId?: string;
  visibility: string;
  views: number;
  duration: number | null;
  createdAt: Date;

  user: {
    id: string;
    name: string;
    displayUsername: string | null;
    image: string | null;
  };
};

declare type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  placeholder?: string;
  as?: "input" | "textarea" | "select";
  options?: Array<{ value: string; label: string }>;
};

declare type FileInputProps = {
  id: string;
  accept: string;
  file: File | null;
  previewUrl: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  type: "video" | "image";
};

declare type FormUploadErrors = {
  video?: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  submit?: string;
};

declare type UserProfile = {
  id: string;
  createdAt: Date | null;
  name: string;
  image: string | null;
  displayUsername: string | null;
};

declare interface AuthSession {
  session: Session;
  user: User;
}

declare type Identity = {
  id: string;
  email: string;
  verified: boolean;
  avatarUrl: string | null;
  fullName: string;
  displayName: string;
  lastSignIn: Date;
};

declare type VideoVisibility = "public" | "private" | "unlisted";

declare type CreateVideoInput = {
  title: string;
  description: string;
  visibility: VideoVisibility;
  userId: string;
  video: {
    url: string;
    id: string;
    duration?: number;
  };
  thumbnail: {
    url: string;
    id: string;
  };
};

declare interface ScreenRecordingState {
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordedVideoUrl: string;
  recordingDuration: number;
}

declare interface ExtendedMediaStream extends MediaStream {
  _originalStreams?: MediaStream[];
}

declare interface RecordingHandlers {
  onDataAvailable: (e: BlobEvent) => void;
  onStop: () => void;
}

declare interface SharedHeaderProps {
  subHeader: string;
  title: string;
  userImg?: string | null;
}

declare type PageErrorType = "notFound" | "isPrivate" | "server";

declare interface ActionResultError {
  message: string;
  status: number;
  type: PageErrorType;
}

declare interface ActionResultType {
  data?: Awaited<T>;
  error?: ActionResultError;
}
