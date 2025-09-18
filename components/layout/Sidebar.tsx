import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Toolbar,
  CircularProgress
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import SendIcon from '@mui/icons-material/Send';
import DraftsIcon from '@mui/icons-material/Drafts';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchMailboxes } from '../../store/slices/mailSlice';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onComposeClick: () => void;
  drawerWidth: number;
  isMobile: boolean;
}

const folderIcons: { [key: string]: React.ReactElement } = {
  inbox: <InboxIcon />,
  sent: <SendIcon />,
  drafts: <DraftsIcon />,
  trash: <DeleteIcon />,
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onComposeClick, drawerWidth, isMobile }) => {
  const dispatch = useAppDispatch();
  const { mailboxes, status } = useAppSelector((state) => state.mail);
  const { t } = useTranslation();

  useEffect(() => {
    // Fetch mailboxes only if they haven't been fetched yet
    if (mailboxes.length === 0) {
      dispatch(fetchMailboxes());
    }
  }, [dispatch, mailboxes.length]);

  const drawerContent = (
    <div>
      <Toolbar />
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<EditIcon />}
          onClick={onComposeClick}
          sx={{ py: 1.5 }}
        >
          {t('compose')}
        </Button>
      </Box>
      {status === 'loading' && mailboxes.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
        </Box>
      ) : (
        <List>
            {mailboxes.map((folder) => (
            <ListItem key={folder.id} disablePadding>
                <ListItemButton
                component={NavLink}
                to={`/folder/${folder.id}`}
                onClick={onClose}
                sx={{
                    '&.active': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                    },
                    },
                }}
                >
                <ListItemIcon>{folderIcons[folder.id.toLowerCase()] || <InboxIcon />}</ListItemIcon>
                <ListItemText primary={t(folder.id.toLowerCase(), { defaultValue: folder.name })} />
                </ListItemButton>
            </ListItem>
            ))}
        </List>
      )}
    </div>
  );

  return (
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? isOpen : true}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>
  );
};

export default Sidebar;