
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // =================================
  // LOAD FAVORITES FROM SUPABASE
  // =================================

  useEffect(() => {
    let mounted = true;

    const loadFavorites = async () => {
      if (authLoading) return;

      if (!user) {
        setFavorites([]);
        setIsLoaded(true);
        return;
      }

      setIsLoaded(false);

      try {
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            animal_id,
            animals (*)
          `)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        if (mounted) {
          const loadedFavorites = (data || [])
            .filter((item) => item.animals)
            .map((item) => {
              const animal = item.animals;

              return {
                ...animal,
                id: animal.id,
                image: animal.image || animal.image_url || '',
              };
            });

          setFavorites(loadedFavorites);
        }
      } catch (error) {
        console.error('Load Favorites Error:', error.message);

        if (mounted) {
          setFavorites([]);
        }
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    };

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, [user?.id, authLoading]);

  // =================================
  // TOGGLE FAVORITE
  // =================================

  const toggleFavorite = async (pet) => {
    if (!user || !isLoaded || !pet || pet.id === undefined) {
      return;
    }

    const alreadyFavorite = favorites.some(
      (item) => String(item.id) === String(pet.id)
    );

    try {
      if (alreadyFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('animal_id', pet.id);

        if (error) {
          throw error;
        }

        setFavorites((previousFavorites) =>
          previousFavorites.filter(
            (item) => String(item.id) !== String(pet.id)
          )
        );
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            animal_id: pet.id,
          });

        if (error) {
          throw error;
        }

        setFavorites((previousFavorites) => [
          ...previousFavorites,
          {
            ...pet,
            image: pet.image || pet.image_url || '',
          },
        ]);
      }
    } catch (error) {
      console.error('Toggle Favorite Error:', error.message);
    }
  };

  // =================================
  // CHECK FAVORITE
  // =================================

  const isFavorite = (id) => {
    return favorites.some(
      (item) => String(item.id) === String(id)
    );
  };

  // =================================
  // CLEAR FAVORITES
  // =================================

  const clearFavorites = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setFavorites([]);
    } catch (error) {
      console.error('Clear Favorites Error:', error.message);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        isLoaded,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// =================================
// CUSTOM HOOK
// =================================

export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      'useFavorites must be used inside FavoritesProvider'
    );
  }

  return context;
};
