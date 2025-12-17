import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material'
import {
  Save,
  History,
  Settings,
  Logout,
  Person
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

export function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = async () => {
    await signOut()
    handleClose()
  }

  const handleProfileClick = () => {
    navigate('/profile')
    handleClose()
  }

  const handleMySetupsClick = () => {
    navigate('/my-setups')
    handleClose()
  }

  const handleAnalysisHistoryClick = () => {
    navigate('/analysis-history')
    handleClose()
  }

  const handleSettingsClick = () => {
    navigate('/settings')
    handleClose()
  }

  if (!user) return null

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {avatarLetter}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
        
        <Divider />
        
        {/* Menu Items */}
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleMySetupsClick}>
          <ListItemIcon>
            <Save fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Tank Setups</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleAnalysisHistoryClick}>
          <ListItemIcon>
            <History fontSize="small" />
          </ListItemIcon>
          <ListItemText>Analysis History</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}