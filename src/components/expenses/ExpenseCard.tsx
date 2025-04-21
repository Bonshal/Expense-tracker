import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text, IconButton, Menu } from 'react-native-paper';

// Define the type for Expense Card props based on DB structure
export interface ExpenseCardProps {
  id: string;
  name: string;
  amount: number;
  category?: string; // Optional
  is_favorite?: boolean; // Optional
  onPress?: () => void; // Optional action on press
  onLongPress?: () => void; // Add onLongPress for dragging
  onToggleFavorite?: (id: string, currentFavorite: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToToday?: (card: ExpenseCardProps) => void; // Add this prop
  isDragging?: boolean; // Add isDragging prop
  style?: StyleProp<ViewStyle>; // Allow passing custom styles
  currencySymbol?: string; // Add currency symbol prop
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  id,
  name,
  amount,
  category,
  is_favorite = false,
  onPress,
  onLongPress, // Destructure onLongPress
  onToggleFavorite,
  onEdit,
  onDelete,
  onAddToToday, // Destructure the new prop
  isDragging, // Destructure isDragging
  style, // Destructure style
  currencySymbol = '$', // Default currency symbol
}) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleFavoritePress = () => {
    if (onToggleFavorite) {
      onToggleFavorite(id, is_favorite);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    if (onDelete) {
      onDelete();
    }
  };

  // Handler for the new "Add to Today" action
  const handleAddToToday = () => {
    setMenuVisible(false);
    if (onAddToToday) {
      // Pass the relevant card data back up
      onAddToToday({ id, name, amount, category, is_favorite });
    }
  };

  return (
    <Card 
      style={[styles.card, style]} 
      onPress={onPress} 
      onLongPress={onLongPress} // Pass onLongPress to the Card
      mode="elevated"
      elevation={isDragging ? 5 : 2} // Increase elevation when dragging
    >
      <Card.Title
        title={name}
        titleNumberOfLines={1}
        subtitle={category ? `Cat: ${category}` : 'No Category'}
        subtitleNumberOfLines={1}
        // Conditionally render the right prop (Menu) only if NOT dragging
        right={isDragging ? undefined : (props) => (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                {...props}
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
                size={20}
              />
            }
          >
            <Menu.Item
              onPress={handleAddToToday}
              title="Add to Today"
              leadingIcon="calendar-plus" // Example icon
            />
            <Menu.Item
              onPress={handleEdit}
              title="Edit"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={handleDelete}
              title="Delete"
              leadingIcon="delete"
            />
            <Menu.Item
              onPress={handleFavoritePress}
              title={is_favorite ? "Remove from Favorites" : "Add to Favorites"}
              leadingIcon={is_favorite ? "star-off" : "star"}
            />
          </Menu>
        )}
      />
      <Card.Content>
        <Text style={styles.amountText}>{currencySymbol}{amount.toFixed(2)}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    marginHorizontal: 5,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ExpenseCard; 