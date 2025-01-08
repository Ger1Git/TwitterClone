import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useFollow = () => {
    const queryClient = useQueryClient();
    const { mutate: follow, isPending } = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                    method: 'POST'
                });

                if (!res.ok) {
                    throw new Error('Something went wrong');
                }

                const data = await res.json();

                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['suggestedUsers'] }),
                queryClient.invalidateQueries({ queryKey: ['authUser'] })
            ])
                .then(() => {
                    console.log('Both queries invalidated successfully!');
                })
                .catch((error) => {
                    console.error('Error invalidating queries:', error);
                });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return { follow, isPending };
};

export default useFollow;
