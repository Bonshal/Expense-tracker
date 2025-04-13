import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  LayoutChangeEvent,
} from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  List,
  Snackbar,
} from 'react-native-paper';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
  DragEndParams,
} from 'react-native-draggable-flatlist';
import { useExpenseCards } from '../../src/hooks/useExpenseCards';
import { useExpenses } from '../../src/hooks/useExpenses';
import type { Expense } from '../../src/types/expense';
import ExpenseCard, { ExpenseCardProps } from '../../src/components/expenses/ExpenseCard';
import AddExpenseModal from '../../src/components/expenses/AddExpenseModal';
import { useRouter } from 'expo-router';
import AddExpenseCardModal from '../../src/components/expenses/AddExpenseCardModal';
import EditExpenseCardModal from '../../src/components/expenses/EditExpenseCardModal';
import { useSettings } from '../../src/contexts/SettingsContext';
import { CURRENCIES } from '../../src/constants/currencies';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface LayoutData {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Define proper types for the SafeDraggableFlatList component
interface SafeDraggableFlatListProps<T> {
  data: T[];
  renderItem: (params: RenderItemParams<T>) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onDragBegin?: (index: number) => void;
  onDragEnd?: (params: DragEndParams<T>) => void;
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  ListEmptyComponent?: React.ReactNode;
  contentContainerStyle?: any;
  activationDistance?: number;
  [key: string]: any; // Allow any other props
}

// Add a safety wrapper for the DraggableFlatList component to catch any internal errors
function SafeDraggableFlatList<T>(props: SafeDraggableFlatListProps<T>) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>
          Error rendering draggable list
        </Text>
        <Button onPress={() => setHasError(false)}>Retry</Button>
      </View>
    );
  }

  try {
    // Extra safety check for data
    if (!props.data || !Array.isArray(props.data) || props.data.length === 0) {
      return (
        <Text style={{ padding: 20, textAlign: 'center' }}>
          No items to display
        </Text>
      );
    }

    return <DraggableFlatList<T> {...props} />;
  } catch (error) {
    console.error("[SafeDraggableFlatList] Error:", error);
    setHasError(true);
    return null;
  }
}

export default function DashboardScreen() {
  const {
    expenseCards,
    loading: loadingCards,
    error: errorCards,
    refetchExpenseCards,
    addExpenseCard,
    toggleFavorite,
    deleteExpenseCard,
    editExpenseCard,
    adding: addingCard,
  } = useExpenseCards();
  const {
    expenses,
    loading: loadingExpenses,
    error: errorExpenses,
    refetchExpenses,
    addExpense,
    adding: addingExpense,
    error: errorAdding,
  } = useExpenses();
  const { currency } = useSettings();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCardModalVisible, setIsCardModalVisible] = useState(false);
  const [isEditCardModalVisible, setIsEditCardModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ExpenseCardProps | null>(null);

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  const [draggedCardData, setDraggedCardData] = useState<ExpenseCardProps | null>(null);
  const [todayExpensesLayout, setTodayExpensesLayout] = useState<LayoutData | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const todayExpensesCardRef = useRef<View>(null);

  // --- Re-add Shared Values ---
  const scrollOffsetY = useSharedValue(0);
  const dragAbsoluteX = useSharedValue(0);
  const dragAbsoluteY = useSharedValue(0);
  // Shared value to track if DraggableFlatList drag is active
  const isDraggingShared = useSharedValue(false);

  const todaysExpenses = useMemo(() => {
    if (!expenses || !Array.isArray(expenses)) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return expenses.filter((exp) => {
      const expenseDate = new Date(exp.date);
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate.getTime() === today.getTime();
    });
  }, [expenses]);

  const handleAddExpenseCard = async (cardData: { name: string; amount: number; category?: string }) => {
    await addExpenseCard(cardData);
    setIsCardModalVisible(false);
  };

  const handleEditExpenseCard = async (cardId: string, updates: { name?: string; amount?: number; category?: string }) => {
    await editExpenseCard(cardId, updates);
    setIsEditCardModalVisible(false);
    setSelectedCard(null);
  };

  const handleDeleteExpenseCard = async (cardId: string) => {
    await deleteExpenseCard(cardId);
  };

  const handleCardPress = (card: ExpenseCardProps) => {
    setSelectedCard(card);
    setIsEditCardModalVisible(true);
  };

  const handleEditCardPress = (card: ExpenseCardProps) => {
    setSelectedCard(card);
    setIsEditCardModalVisible(true);
  };

  const handleAddExpenseFromDrop = useCallback(async (card: ExpenseCardProps) => {
    if (!card) {
      console.warn('[Dashboard DnD] Attempted to add expense from undefined card');
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const expenseData = {
      amount: card.amount,
      description: card.name,
      category: card.category || 'Uncategorized',
      date: today,
      expense_card_id: card.id,
    };
    
    try {
      console.log('[Dashboard DnD] Adding expense from drop:', expenseData);
      await addExpense(expenseData);
      setSnackbarMessage(`${currencySymbol}${card.amount.toFixed(2)} added to today's expenses`);
      setSnackbarVisible(true);
      refetchExpenses();
    } catch (err) {
      console.error('[Dashboard DnD] Error adding expense from drop:', err);
      setSnackbarMessage('Error adding expense');
      setSnackbarVisible(true);
    }
  }, [addExpense, currencySymbol, refetchExpenses]);

  const handleDragBegin = useCallback((index: number) => {
    const safeExpenseCards = expenseCards || [];
    if (index >= 0 && index < safeExpenseCards.length) {
      const item = safeExpenseCards[index];
      console.log('[Dashboard DnD] Drag Begin:', item.name);
      setDraggedCardData(item);
      isDraggingShared.value = true;
    } else {
      console.warn('[Dashboard DnD] Drag begin triggered for invalid index:', index);
    }
  }, [expenseCards, isDraggingShared]);

  const handleDragEnd = useCallback((params: DragEndParams<ExpenseCardProps>) => {
    console.log('[Dashboard DnD] DraggableFlatList handleDragEnd called');
    isDraggingShared.value = false;
  }, [isDraggingShared]);

  const onTodayExpensesLayout = useCallback((event: LayoutChangeEvent) => {
    // Use measureInWindow again for absolute coordinates
    todayExpensesCardRef.current?.measureInWindow((x, y, width, height) => {
      if (typeof x === 'number' && typeof y === 'number' && 
          typeof width === 'number' && typeof height === 'number' && 
          width > 0 && height > 0) {
        console.log(`[Dashboard DnD] Today's Expenses Measured (Window): x=${x}, y=${y}, width=${width}, height=${height}`);
        setTodayExpensesLayout({ x, y, width, height });
      } else {
        console.warn("[Dashboard DnD] Failed to measure Today's Expenses layout correctly.");
        setTodayExpensesLayout(null);
      }
    });
  }, []);

  const renderDraggableExpenseCard = useCallback(({ item, drag, isActive }: RenderItemParams<ExpenseCardProps>) => {
    if (!item) {
      return null;
    }
    return (
      <ScaleDecorator>
        <ExpenseCard
          {...item}
          onLongPress={drag} 
          onToggleFavorite={toggleFavorite}
          onEdit={() => handleEditCardPress(item)}
          onDelete={() => handleDeleteExpenseCard(item.id)}
          isDragging={isActive}
          style={[styles.quickAddCard, isActive ? styles.draggingCard : {}]}
        />
      </ScaleDecorator>
    );
  }, [toggleFavorite, handleEditCardPress, handleDeleteExpenseCard, currencySymbol]);

  const openAddExpenseModal = () => setIsModalVisible(true);
  const closeAddExpenseModal = () => setIsModalVisible(false);

  const handleAddExpenseFromModal = async (expenseData: any) => {
    await addExpense(expenseData);
    if (!errorAdding) {
      closeAddExpenseModal();
      setSnackbarMessage('Expense added successfully');
      setSnackbarVisible(true);
      refetchExpenses();
    } else {
      console.error('Error adding expense from modal:', errorAdding);
    }
  };

  const { dailyTotal, monthlyTotal } = useMemo(() => {
    if (!expenses || !Array.isArray(expenses)) {
      return { dailyTotal: 0, monthlyTotal: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let dayTotal = 0;
    let monthTotal = 0;

    expenses.forEach((expense) => {
      if (!expense) return;
      
      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);

      if (expenseDate.getTime() === today.getTime()) {
        dayTotal += expense.amount;
      }

      if (expenseDate >= firstDayOfMonth && expenseDate <= today) {
        monthTotal += expense.amount;
      }
    });

    return { 
      dailyTotal: Number(dayTotal.toFixed(2)), 
      monthlyTotal: Number(monthTotal.toFixed(2)) 
    };
  }, [expenses]);

  const safeExpenseCards = useMemo(() => {
    try {
      // Triple-check that we have a valid array
      if (!expenseCards) return [];
      if (!Array.isArray(expenseCards)) return [];
      if (expenseCards.length === 0) return [];
      
      // Deep copy to prevent shared references
      return expenseCards
        .filter((card): card is ExpenseCardProps => !!card && typeof card.id === 'string')
        .map(card => ({
          ...card,
          // Ensure required properties are present
          id: card.id,
          name: card.name,
          amount: card.amount
        }));
    } catch (error) {
      console.error('[Dashboard] Error creating safe expense cards:', error);
      return [];
    }
  }, [expenseCards]);

  // --- Pan Gesture Handler --- 
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event, ctx: any) => {
      // Update shared values with absolute coordinates
      dragAbsoluteX.value = event.absoluteX;
      dragAbsoluteY.value = event.absoluteY;
    },
    // We don't need onStart/onEnd here as isDraggingShared handles the trigger
  });

  // --- Scroll Handler --- 
  const handleScroll = (event: any) => {
    if (event?.nativeEvent?.contentOffset?.y !== undefined) {
      scrollOffsetY.value = event.nativeEvent.contentOffset.y;
    }
  };

  const renderDraggableContent = () => {
    if (loadingCards) {
      return <ActivityIndicator animating={true} style={styles.loader} />;
    }

    if (errorCards) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading cards</Text>
          <Button onPress={refetchExpenseCards}>Retry</Button>
        </View>
      );
    }

    // Make absolutely sure we never pass null data to DraggableFlatList
    const dragListData = safeExpenseCards || [];
    
    if (dragListData.length === 0) {
      return <Text style={styles.emptyText}>No expense cards found. Add some!</Text>;
    }

    // Create a completely fresh array with new objects
    const secureData: ExpenseCardProps[] = dragListData.map(card => ({
      id: card.id,
      name: card.name,
      amount: card.amount,
      category: card.category,
      is_favorite: card.is_favorite,
      onLongPress: card.onLongPress,
      onToggleFavorite: card.onToggleFavorite,
      onEdit: card.onEdit,
      onDelete: card.onDelete,
      isDragging: card.isDragging,
      style: card.style,
      currencySymbol: card.currencySymbol
    }));

    // Define ListEmptyComponent as a proper component
    const ListEmpty = () => <Text style={styles.emptyText}>No expense cards found. Add some!</Text>;

    try {
      // Re-add PanGestureHandler wrapper
      return (
        <PanGestureHandler 
            onGestureEvent={gestureHandler} 
            simultaneousHandlers={scrollViewRef}
            // Optional: Add minPointers={1}, maxPointers={1} for stability
        >
          <Animated.View style={styles.draggableContainer}>
            <DraggableFlatList<ExpenseCardProps>
              data={secureData} 
              renderItem={renderDraggableExpenseCard}
              keyExtractor={(item) => item.id}
              onDragBegin={handleDragBegin}
              onDragEnd={handleDragEnd}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={ListEmpty}
              contentContainerStyle={styles.cardList}
              activationDistance={20}
              simultaneousHandlers={scrollViewRef} // Allow scroll and drag
            />
          </Animated.View>
        </PanGestureHandler>
      );
    } catch (error) {
      console.error("[Dashboard] Error rendering DraggableFlatList:", error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error with drag functionality</Text>
          <Button onPress={refetchExpenseCards}>Retry</Button>
        </View>
      );
    }
  };

  // --- Collision Check Function (called via runOnJS) ---
  const checkDropCollision = (finalX: number, finalY: number) => {
    console.log('[CheckDropCollision] Checking...');
    const layout = todayExpensesLayout; // Read current layout state
    const card = draggedCardData; // Read current dragged card state
    
    // Clear the dragged card data *after* checking
    // Note: Delaying this clear might be necessary if re-renders cause issues
    setDraggedCardData(null);

    if (card && layout) {
      console.log(`[CheckDropCollision] Coords: (${finalX}, ${finalY}), Layout:`, layout);
      const { x: targetX, y: targetY, width: targetWidth, height: targetHeight } = layout;
      
      // Perform boundary check (using absolute coordinates now)
      if (
        finalX >= targetX &&
        finalX <= targetX + targetWidth &&
        finalY >= targetY &&
        finalY <= targetY + targetHeight
      ) {
        console.log('[CheckDropCollision] Drop SUCCESS on target for card:', card.name);
        handleAddExpenseFromDrop(card); // Assuming handleAddExpenseFromDrop is defined above
      } else {
        console.log('[CheckDropCollision] Drop outside target.');
      }
    } else {
      console.log('[CheckDropCollision] Missing card or layout data.');
    }
  };

  // --- Animated Reaction --- 
  useAnimatedReaction(
    () => isDraggingShared.value, // Watch the dragging state
    (result, previous) => {
      if (result === false && previous === true) {
        // Drag just ended!
        // Read the final absolute coordinates from shared values
        const finalX = dragAbsoluteX.value;
        const finalY = dragAbsoluteY.value;
        // Call the JS function to perform the check
        runOnJS(checkDropCollision)(finalX, finalY);
      }
    },
    [checkDropCollision] // Include the JS function in dependencies
  );

  // Animated style for the drop zone (optional, might flicker)
  const animatedDropZoneStyle = useAnimatedStyle(() => {
    return {
        backgroundColor: isDraggingShared.value ? '#e3f2fd' : undefined, // Set to undefined or a default background color
        borderColor: isDraggingShared.value ? '#2196f3' : 'transparent',
        borderWidth: isDraggingShared.value ? 2 : 0,
        borderStyle: isDraggingShared.value ? 'dashed' : 'solid',
    };
  });

  if (loadingCards) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (errorCards) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading expense cards</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Dashboard" />
      </Appbar.Header>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        scrollEventThrottle={16} // Important for scroll updates
        onScroll={handleScroll}    // Re-attach scroll handler
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title>Overview</Title>
            {loadingExpenses ? (
              <ActivityIndicator animating={true} />
            ) : (
              <>
                <Paragraph>Monthly Total: {currencySymbol}{monthlyTotal.toFixed(2)}</Paragraph>
                <Paragraph>Today's Total: {currencySymbol}{dailyTotal.toFixed(2)}</Paragraph>
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeaderContainer}>
              <Title>Quick Add Expense Cards</Title>
              <Button
                mode="contained-tonal"
                onPress={() => setIsCardModalVisible(true)}
                style={styles.manageButton}
              >
                Add Card
              </Button>
            </View>
            {renderDraggableContent()}
          </Card.Content>
        </Card>

        <View ref={todayExpensesCardRef} onLayout={onTodayExpensesLayout} collapsable={false}>
          <Animated.View style={[styles.card, animatedDropZoneStyle]}>
            <Card.Content>
              <Title>Today's Expenses</Title>
              {loadingExpenses && <ActivityIndicator animating={true} />}
              {errorExpenses && <Paragraph style={styles.errorText}>Could not load today's expenses.</Paragraph>}
              {!loadingExpenses && !errorExpenses && (
                !todaysExpenses || todaysExpenses.length === 0 ? (
                  <Paragraph>No expenses logged today.</Paragraph>
                ) : (
                  todaysExpenses.map((item) => (
                    item && (
                      <List.Item
                        key={item.id}
                        title={item.description || 'Expense'}
                        description={item.category}
                        left={(props) => <List.Icon {...props} icon="cash" />}
                        right={() => <Text style={styles.itemAmount}>{currencySymbol}{item.amount.toFixed(2)}</Text>}
                      />
                    )
                  ))
                )
              )}
            </Card.Content>
          </Animated.View>
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAddExpenseModal}
        label="Add Expense"
      />

      <AddExpenseModal
        visible={isModalVisible}
        onDismiss={closeAddExpenseModal}
        onSubmit={handleAddExpenseFromModal}
        submitting={addingExpense}
      />
      <AddExpenseCardModal
        visible={isCardModalVisible}
        onDismiss={() => setIsCardModalVisible(false)}
        onSubmit={handleAddExpenseCard}
        submitting={addingCard}
      />
      {selectedCard && (
        <EditExpenseCardModal
          visible={isEditCardModalVisible}
          onDismiss={() => {
            setIsEditCardModalVisible(false);
            setSelectedCard(null);
          }}
          onSubmit={handleEditExpenseCard}
          card={selectedCard}
          submitting={addingCard}
        />
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    marginBottom: 16,
  },
  dropZoneActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardList: {
    paddingVertical: 10,
  },
  quickAddCard: {
    marginRight: 10,
    width: 150,
    minHeight: 80,
    justifyContent: 'center',
  },
  draggingCard: {
     // This style might not be needed if placeholder is used exclusively
     // opacity: 0.7,
     // backgroundColor: '#e0e0e0',
  },
  draggingPlaceholder: { 
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8, 
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.85,
    backgroundColor: '#fafafa',
    height: 80,
    padding: 10,
  },
  draggingPlaceholderText: {
    color: '#424242',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  draggingPlaceholderAmount: {
    color: '#616161',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  itemAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    paddingRight: 8,
  },
  manageButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
  },
  draggableContainer: {
    minHeight: 100,
    paddingVertical: 10,
  },
}); 