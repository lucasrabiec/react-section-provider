import {
  createContext,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface SectionContextType {
  currentSection: ReactElement;
  isFirstSection: boolean;
  isLastSection: boolean;
  next: () => void;
  previous: () => void;
  reset: () => void;
  close: () => void;
}

interface SectionProviderProps {
  sections: ReactElement[];
  isOpen: boolean;
  onClose: () => void;
}

export function SectionProvider({
  sections,
  children,
  onClose,
  isOpen,
}: PropsWithChildren<SectionProviderProps>) {
  const firstIndex = 0;
  const lastIndex = sections.length - 1;
  const [currentIndex, setCurrentIndex] = useState<number>(firstIndex);
  const [currentSection, setCurrentSection] = useState<ReactElement>(
    sections[firstIndex],
  );
  const [isFirstSection, setIsFirstSection] = useState<boolean>(true);
  const [isLastSection, setIsLastSection] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSection(sections[currentIndex]);
    currentIndex === firstIndex
      ? setIsFirstSection(true)
      : setIsFirstSection(false);
    currentIndex === lastIndex
      ? setIsLastSection(true)
      : setIsLastSection(false);

    // Reset to first Section after 'close' (for modal-like components after ensuring they are not visible).
    const timer = setTimeout(() => {
      if (!isOpen) {
        setCurrentIndex(0);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [sections, currentIndex, lastIndex, isOpen]);

  const next = useCallback(
    () => setCurrentIndex((prevState) => Math.min(prevState + 1, lastIndex)),
    [lastIndex],
  );
  const previous = useCallback(
    () => setCurrentIndex((prevState) => Math.max(prevState - 1, firstIndex)),
    [],
  );
  const reset = useCallback(() => setCurrentIndex(0), []);
  const close = useCallback(() => onClose(), [onClose]);

  const memoizedValue = useMemo(
    () => ({
      currentSection,
      isFirstSection,
      isLastSection,
      next,
      previous,
      reset,
      close,
    }),
    [
      currentSection,
      isFirstSection,
      isLastSection,
      next,
      previous,
      reset,
      close,
    ],
  );

  return (
    <SectionContext.Provider value={memoizedValue}>
      {children}
    </SectionContext.Provider>
  );
}

export const SectionContext = createContext<SectionContextType>(
  {} as SectionContextType,
);

export function useSection() {
  const context = useContext(SectionContext);
  if (!context || !Object.keys(context).length) {
    throw new Error('SectionContext must be within SectionProvider');
  }

  return context;
}
